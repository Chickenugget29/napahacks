from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import List, Optional, Sequence

logger = logging.getLogger(__name__)

try:
    import amrlib  # type: ignore
except Exception:  # pragma: no cover
    amrlib = None

try:
    from allennlp_models.pretrained import load_predictor  # type: ignore
except Exception:  # pragma: no cover
    load_predictor = None


@dataclass
class SemanticParseResult:
    text: str
    amr: Optional[str] = None
    intents: List[str] = field(default_factory=list)
    entities: List[str] = field(default_factory=list)
    polarity: Optional[str] = None


class SemanticParser:
    """Best-effort semantic parser using AMR + semantic role labeling when available."""

    def __init__(self) -> None:
        self._amr = self._init_amr()
        self._semparse = self._init_semparse()

    def parse_sentences(self, sentences: Sequence[str]) -> List[SemanticParseResult]:
        amr_graphs = self._run_amr(sentences)
        results: List[SemanticParseResult] = []
        for idx, sentence in enumerate(sentences):
            amr = amr_graphs[idx] if idx < len(amr_graphs) else None
            intents, entities = self._extract_from_amr(amr)
            polarity = self._infer_polarity(sentence, amr)
            sem_intents, sem_entities = self._run_semparse(sentence)
            intents.extend(sem_intents)
            entities.extend(sem_entities)
            results.append(
                SemanticParseResult(
                    text=sentence,
                    amr=amr,
                    intents=self._dedupe(intents),
                    entities=self._dedupe(entities),
                    polarity=polarity,
                )
            )
        return results

    def _init_amr(self):
        if not amrlib:
            return None
        try:
            return amrlib.AMRParser.from_pretrained("model_parse_xfm_bart_large")
        except Exception as exc:  # pragma: no cover
            logger.warning("Failed to init AMR parser: %s", exc)
            return None

    def _init_semparse(self):
        if not load_predictor:
            return None
        try:
            return load_predictor("structured-prediction-srl")
        except Exception as exc:  # pragma: no cover
            logger.warning("Failed to init AllenNLP SRL: %s", exc)
            return None

    def _run_amr(self, sentences: Sequence[str]) -> List[Optional[str]]:
        if not self._amr or not sentences:
            return [None] * len(sentences)
        try:
            return self._amr.parse_sents(list(sentences))  # type: ignore[operator]
        except Exception as exc:  # pragma: no cover
            logger.warning("AMR parsing failed: %s", exc)
            return [None] * len(sentences)

    def _run_semparse(self, sentence: str) -> tuple[List[str], List[str]]:
        if not self._semparse:
            return [], []
        try:
            prediction = self._semparse.predict(sentence=sentence)  # type: ignore[operator]
        except Exception as exc:  # pragma: no cover
            logger.warning("AllenNLP SRL failed: %s", exc)
            return [], []
        intents: List[str] = []
        entities: List[str] = []
        for verb in prediction.get("verbs", []):
            description = verb.get("description", "")
            verb_text = verb.get("verb", "")
            if "ARG1" in description or "ARG2" in description:
                entities.append(verb_text)
            if "ARGM-PURP" in description or "ARGM-CAU" in description:
                intents.append(verb_text)
        return intents, entities

    def _extract_from_amr(self, amr: Optional[str]) -> tuple[List[str], List[str]]:
        if not amr:
            return [], []
        intents: List[str] = []
        entities: List[str] = []
        for match in re.finditer(r":ARG\d+\s+\(([\w\-]+)\s+/\s+([\w\-]+)\)", amr):
            role = match.group(1)
            concept = match.group(2).replace("_", " ")
            if "intent" in role or role in {"goal", "purpose"}:
                intents.append(concept)
            else:
                entities.append(concept)
        return intents, entities

    def _infer_polarity(self, text: str, amr: Optional[str]) -> Optional[str]:
        lowered = text.lower()
        if any(token in lowered for token in ("must not", "never", "cannot", "forbid", "ban")):
            return "negative"
        if amr and ":polarity -" in amr:
            return "negative"
        if any(token in lowered for token in ("allowed", "may", "permitted", "can")):
            return "positive"
        return None

    def _dedupe(self, items: Sequence[str]) -> List[str]:
        seen = set()
        ordered: List[str] = []
        for item in items:
            normalized = item.strip().lower()
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            ordered.append(normalized)
        return ordered

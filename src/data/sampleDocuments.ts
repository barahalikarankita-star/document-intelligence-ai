export interface SampleDocDef {
  id: string;
  name: string;
  size: number;
  type: string;
  pages: { pageNumber: number; text: string }[];
}

export const SAMPLE_DOCUMENTS: SampleDocDef[] = [
  {
    id: "sample-ml-foundations",
    name: "Machine_Learning_Foundations_Diploma.pdf",
    size: 245000,
    type: "application/pdf",
    pages: [
      {
        pageNumber: 1,
        text: `DIPLOMA IN ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
Module 4: Natural Language Processing & Vector Space Foundations

1.1 Introduction to Document Intelligence
Traditional document search relies on lexical keyword indexing (such as BM25 or inverted index trees). However, lexical systems fail when queries express synonyms or conceptual paraphrasing without exact word matches. Document Intelligence bridges this semantic gap by combining optical character recognition (OCR), structural layout preservation, NLP sentence tokenization, and deep dense vector embeddings.

1.2 Text Preprocessing and Tokenization Pipelines
Text preprocessing involves removing non-informative control tokens, normalizing Unicode whitespace, segmenting continuous text streams into discrete lexical tokens, and separating punctuation. In standard NLP pipelines, stopword filtering (e.g. removing frequent conjunctions like "and", "the", "with") reduces index noise, while subword tokenizers (Byte-Pair Encoding, WordPiece) break rare morphological compounds into known subword tokens.

1.3 Dense Semantic Embeddings vs. Sparse Representations
While sparse representations (Bag of Words, TF-IDF) suffer from orthogonal dimensionality curse and sparsity, modern Transformer encoders project natural language sentences into dense continuous vector spaces (e.g., 768 or 1536 dimensions). In this geometry, semantic similarity corresponds directly to vector proximity, measured using inner dot products or normalized Cosine Similarity.`
      },
      {
        pageNumber: 2,
        text: `1.4 Multi-Head Self-Attention and Contextual Encodings
The Transformer architecture revolutionized NLP through the self-attention mechanism:
Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V
Where Query (Q), Key (K), and Value (V) projections allow every token to attend to every other token across bidirectional sequence contexts. Unlike recurrent neural networks (RNNs) or LSTMs, Transformers capture long-range linguistic dependencies in O(1) sequential time, producing rich contextual sentence representations that preserve semantic nuance across paragraphs.

1.5 Document Chunking Strategies & Overlap Math
When indexing lengthy PDF manuscripts into vector databases like ChromaDB, text must be partitioned into coherent chunks. The standard sliding-window chunking protocol defines:
- Chunk Size (L): typically 250 to 500 words or subword tokens, preserving sufficient contextual boundary.
- Chunk Overlap (O): typically 10% to 20% (e.g., 40 to 80 tokens).
Chunk overlap ensures that sentences crossing arbitrary split boundaries are not clipped, preserving subject-predicate continuity between sequential chunk passages.

1.6 Vector Storage with ChromaDB
ChromaDB serves as an open-source, lightweight embedding database designed for AI application retrieval. It indexes document vectors using Hierarchical Navigable Small World (HNSW) graphs, enabling approximate nearest neighbor (ANN) lookups with logarithmic time complexity O(log N). Metadata filtering allows retrieval queries to isolate specific document IDs or page numbers.`
      },
      {
        pageNumber: 3,
        text: `1.7 Retrieval-Augmented Generation (RAG) Architecture
Retrieval-Augmented Generation couples semantic vector retrieval with generative large language models. The workflow executes in three synchronized phases:
Phase 1 - Semantic Query Embedding: The user's input prompt is embedded into the vector space using the identical encoder employed for document chunking.
Phase 2 - Top-K Vector Retrieval: ChromaDB queries its vector index to retrieve the K most relevant chunks based on Cosine Distance:
Distance = 1 - (A . B) / (||A||_2 * ||B||_2)
Phase 3 - Context-Augmented Prompting: The retrieved chunk passages are injected as bounded factual grounding into the generative LLM (Google Gemini). The model is instructed to synthesize answers strictly referencing the provided context with explicit page and chunk citations.

1.8 Evaluation Metrics: Recall@K, Precision@K, and Grounding Fidelity
To measure document retrieval efficacy, standard evaluation metrics include:
- Recall@K: Proportion of relevant document passages retrieved within top K candidates.
- Mean Reciprocal Rank (MRR): Evaluates where the first truly relevant passage occurs in the ranked results.
- Grounding Fidelity: Ratio of claims in the generated AI response that are directly verifiable in retrieved source citations, mitigating generative hallucination.`
      }
    ]
  },
  {
    id: "sample-clinical-ai",
    name: "Healthcare_Clinical_AI_Analysis.pdf",
    size: 312000,
    type: "application/pdf",
    pages: [
      {
        pageNumber: 1,
        text: `CLINICAL ARTIFICIAL INTELLIGENCE RESEARCH REPORT
Document Intelligence in Electronic Health Records (EHR) & Diagnostic Workflows

2.1 Clinical Document Complexity and Multi-Modal Records
Clinical documentation encompasses unstructured physician discharge summaries, pathology reports, DICOM radiology imaging notes, and lab telemetry. Extracting actionable patient insights requires specialized NLP that understands medical ontology (UMLS, SNOMED-CT, ICD-10). Automated document analysis reduces administrative burnout and flags drug-drug adverse interactions before prescription dispatch.

2.2 Medical Named Entity Recognition (NER)
Standard general-purpose NLP tokenizers frequently mishandle clinical abbreviations (e.g., "b.i.d." for twice daily, "CABG" for coronary artery bypass graft). Clinical NER architectures fine-tuned on BioBERT or PubMedBERT extract four essential clinical entity classes:
1. Disease & Symptom Indicators (e.g., congestive heart failure, dyspnea).
2. Pharmacological Agents & Dosages (e.g., Metformin 500mg, Lisinopril).
3. Anatomical Sites (e.g., left anterior descending coronary artery).
4. Diagnostic Procedures & Interventions (e.g., echocardiogram, percutaneous coronary intervention).`
      },
      {
        pageNumber: 2,
        text: `2.3 HIPAA Compliance, Privacy & Protected Health Information (PHI)
When applying cloud-based generative AI systems to medical records, automated redaction of 18 Safe Harbor PHI identifiers is mandatory under HIPAA and European GDPR standards:
- Patient names, geographic subdivisions smaller than a state.
- All elements of dates directly related to an individual (birth date, admission date, discharge date).
- Social Security numbers, medical record numbers, health plan beneficiary identifiers.
Document Intelligence AI systems enforce strict session-scoped in-memory vector storage with zero persistent retention of unredacted clinical transcripts.

2.4 Diagnostic Validation Metrics: Sensitivity, Specificity, and AUC-ROC
Clinical document classifiers must be evaluated beyond simple accuracy due to severe class imbalances (e.g. rare disease occurrence < 1%):
- Sensitivity (Recall): TP / (TP + FN), measuring ability to identify all true positive cases.
- Specificity: TN / (TN + FP), measuring ability to avoid false positive alarms.
- Area Under the Receiver Operating Characteristic Curve (AUC-ROC): Evaluates diagnostic discrimination across all operational classification thresholds. Clinical-grade deployments require AUC-ROC >= 0.92.`
      },
      {
        pageNumber: 3,
        text: `2.5 Clinical Decision Support System (CDSS) Integration
When vector semantic retrieval feeds an LLM in a hospital clinical decision support pipeline, the system must not generate speculative diagnoses. Instead, the AI serves as a cognitive assistant:
- Highlighting critical lab values outside normal reference ranges.
- Providing verbatim cross-references to clinical guidelines (e.g., AHA/ACC heart failure staging).
- Generating auditable source citations pointing clinicians directly to page numbers and chunk timestamps in the patient chart.

2.6 Limitations & Ethical Considerations in Healthcare AI
Large language models can exhibit sycophancy or hallucinate plausible biomedical citations. In high-stakes patient triage, all Document Intelligence AI outputs must remain human-in-the-loop, requiring final validation and signature by a licensed medical practitioner before integration into official patient records.`
      }
    ]
  },
  {
    id: "sample-autonomous-audit",
    name: "Autonomous_Systems_Safety_Audit.pdf",
    size: 278000,
    type: "application/pdf",
    pages: [
      {
        pageNumber: 1,
        text: `AUTONOMOUS VEHICLE SYSTEMS SAFETY AUDIT
Technical Specifications, Sensor Fusion Architecture & Fail-Safe Protocols

3.1 Sensor Fusion Pipeline & Spatial Perception
Level 4 autonomous driving systems integrate multi-modal sensor inputs to construct a 360-degree real-time dynamic environmental model:
- LiDAR (Light Detection and Ranging): Generates 3D spatial point clouds at 10-20 Hz with centimeter-level precision up to 200 meters, immune to ambient lighting variations.
- High-Resolution Stereo Cameras: Detect color classification, traffic signals, road signs, and lane demarcations using convolutional neural networks (CNNs) and Vision Transformers.
- Radar (Radio Detection and Ranging): Emits 77 GHz electromagnetic waves, providing Doppler velocity measurements robust to heavy rain, fog, and dust.
Sensor fusion algorithms (Extended Kalman Filters, Bayesian particle filters) synthesize these asynchronous streams into unified bounding-box obstacle tracks.

3.2 Functional Safety Standards: ISO 26262 and ASIL-D
Automotive Safety Integrity Level D (ASIL-D) represents the most stringent classification defined by ISO 26262. Systems certified for ASIL-D require:
- Single Point Fault Metric (SPFM) > 99%.
- Latent Fault Metric (LFM) > 90%.
- Random hardware probability of failure < 10^-8 per operating hour.`
      },
      {
        pageNumber: 2,
        text: `3.3 Real-Time Edge AI Latency Budgets
At highway traveling velocities of 120 km/h (33.3 meters per second), every millisecond of algorithmic latency corresponds to 3.33 centimeters of vehicle translation. Total perception-to-actuation pipeline latency must remain under 100 milliseconds:
1. Sensor Capture & Shutter Serialization: 25 ms.
2. Neural Network Object Detection (TensorRT FP16 quantization): 30 ms.
3. Multi-Object Tracking & Path Prediction: 20 ms.
4. Trajectory Generation & Dynamic Model Predictive Control (MPC): 15 ms.
5. CAN Bus Actuator Command Execution: 10 ms.
Exceeding the 100 ms threshold triggers an emergency safe-stop trajectory.

3.4 Fail-Safe Redundancy and Minimal Risk Maneuver (MRM)
In the event of a critical subsystem failure (such as steering actuator fault, GPU thermal throttling, or LiDAR motor stall), the secondary fail-operational domain controller immediately engages the Minimal Risk Maneuver (MRM). The MRM safely decelerates the vehicle within its lane or navigates toward the nearest highway shoulder with hazard lights illuminated.`
      },
      {
        pageNumber: 3,
        text: `3.5 Adversarial Robustness and Out-of-Distribution (OOD) Detection
Deep neural networks deployed in autonomous perception are vulnerable to adversarial perturbations (such as physical sticker attacks on stop signs) and out-of-distribution corner cases (e.g. overturned trucks, unusual construction equipment). Document Intelligence AI audits autonomous telemetry logs by:
- Semantic keyword scanning for disengagement triggers ("takeover_request", "lidar_dropout").
- Correlating sensor anomaly reports with environmental temperature and precipitation logs.
- Generating automated audit summaries for regulatory bodies (NHTSA, UN ECE WP.29).

3.6 Verification & Validation Lifecycle
Comprehensive AV safety verification combines simulation suites (billions of synthetic virtual miles), hardware-in-the-loop (HIL) dynamometer testing, and closed-course track validation. All safety claims must be substantiated by traceable engineering requirements stored in searchable vector databases.`
      }
    ]
  }
];

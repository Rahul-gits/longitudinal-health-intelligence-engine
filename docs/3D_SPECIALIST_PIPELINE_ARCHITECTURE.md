# Heal Engine: 3D Specialist Avatar Pipeline & Architecture Guide

## 1. Executive Summary & Recommended Stack

For Heal Engine's full-stack clinical intelligence platform, selecting an avatar solution cannot simply be about rendering a 3D doctor head. The clinical consultation requires a **complete, decoupled pipeline** that:
1. Renders the doctor in real-time inside the React web application with anatomical fidelity.
2. Synchronizes facial micro-expressions (speech visemes, saccadic eye contact, blink physiology, clinical nodding).
3. Receives patient audio or text input.
4. **Maintains strict separation between avatar presentation and clinical decision-making.** The avatar conveys clinical findings; it never makes autonomous medical decisions. All recommendations pass through Heal Engine's sovereign KDIGO clinical safety gates before being spoken.

### Recommended Stack Matrix

| Layer | Recommended Choice | Rationale |
| :--- | :--- | :--- |
| **3D Rendering** | **React Three Fiber (R3F) + Three.js** | Native WebGL rendering inside React; zero-latency, full camera rotation, lighting control, and local execution with no third-party video lag. |
| **3D Human Model** | **Rigged GLB (Meshy / MetaHuman)** | Anatomical 3D relief mesh with facial blendshapes (ARKit 52 compatible), biological eye spheres with cornea refraction, and authentic clinical attire matching doctor reference personas. |
| **Speech & Lip Sync** | **Local Phonetic Viseme Classifier + Web Audio API** | Real-time temporal interpolation between viseme shapes (`SIL`, `AA`, `EE`, `OH`, `MBP`, `FV`, `LDT`) synchronized with subtitles and audio playback. |
| **Interaction Layer (Optional)** | **Convai Web SDK** | Evaluated as an optional character voice and emotion interaction layer with Three.js/Babylon.js integration, kept strictly subordinate to Heal Engine's safety gates. |
| **High-End Facial Motion** | **NVIDIA Audio2Face Bridge** | ARKit 52 blendshape streaming over WebSocket into the R3F rigged mesh for studio-grade audio-driven facial performance. |
| **Video Presenter Fallback** | **D-ID Agents SDK** | Streaming presenter video fallback for low-power devices; trade-off: returns 2D video rather than a rotatable 3D scene. |
| **Clinical Reasoning & Safety** | **Sovereign Heal Engine Backend** | KDIGO AKI evaluation, Lisinopril + NSAID interaction checks, longitudinal record grounding, and human-in-the-loop escalation. |

---

## 2. Deep-Dive Comparative Evaluation

### Option A: React Three Fiber + Rigged 3D GLB (Recommended Core)
* **How it Works**: A rigged GLB avatar is loaded directly into React Three Fiber (`<Canvas>`). Morphs and kinematics are modulated per frame by React state controllers (`AvatarStateController`, `LipSyncController`, `ExpressionController`, `GestureController`).
* **Strengths**:
  * **Full 3D Control**: Users can orbit around the doctor, adjust clinical lighting presets (Clinical, Warm, Evening), and observe natural 3D depth.
  * **HIPAA Isolation**: 100% of speech rendering and animation logic runs locally in the browser/node environment. No patient dialogues are transmitted to external avatar cloud vendors.
  * **Deterministic State Synchronization**: 8 deterministic consultation states (`GREETING`, `LISTENING`, `UNDERSTANDING`, `REVIEWING`, `EXPLAINING`, `CHECKING`, `REASSURING`, `ALERTING`) directly map to facial expressions and head kinematics.
* **Limitations**: Requires rigging and blendshapes on the 3D model asset.

### Option B: Convai Web SDK (Voice & Character Interaction Layer)
* **Documentation**: [Convai Web SDK Docs](https://docs.convai.com/api-docs/plugins-and-integrations/web-plugins/convai-web-sdk)
* **How it Works**: Connects browser microphone audio directly to Convai's interaction pipeline, outputting character speech, audio stream, and emotion signals with Three.js / Babylon.js bindings.
* **Fit for Heal Engine**:
  * Highly valuable for voice interaction and emotion modulation.
  * **Critical Architecture Rule**: Convai must **never** be given authority over medical advice. Heal Engine's safety gate inspects and approves clinical dialogue before any response is vocalized.

### Option C: D-ID Agents SDK (Fast Talking-Video Avatar Prototype)
* **Documentation**: [D-ID Agents SDK Overview](https://docs.d-id.com/reference/agents-sdk-overview)
* **How it Works**: WebRTC live streaming of an AI presenter talking video generated on D-ID's cloud servers.
* **Key Distinction**: D-ID provides a **streamed 2D video presenter**, not a freely rotatable 3D mesh in your React Three Fiber scene.
* **Fit for Heal Engine**: Excellent as an ultra-fast prototype or low-bandwidth fallback when WebGL 3D hardware acceleration is unavailable.

### Option D: NVIDIA Audio2Face (Studio-Grade Facial Animation)
* **Platform**: [NVIDIA Omniverse](https://www.nvidia.com/en-us/omniverse/)
* **How it Works**: Audio is passed to NVIDIA Omniverse Audio2Face running locally or on an enterprise GPU, producing 52 ARKit blendshape weights at 60 FPS that stream over WebSocket to the web client.
* **Fit for Heal Engine**: Supported via `avatarPipelineService.ts` (`AUDIO2FACE_BRIDGE`), mapping 52 standard facial blendshapes directly onto MetaHuman and rigged GLB face meshes.

---

## 3. Architecture & Separation of Concerns

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HEAL ENGINE CONSULTATION CLIENT                       │
│                                                                             │
│  ┌──────────────────────┐                     ┌──────────────────────────┐  │
│  │   Patient Input      │                     │   3D Specialist Canvas   │  │
│  │ (Microphone / Text)  │                     │   (React Three Fiber)    │  │
│  └──────────┬───────────┘                     └────────────▲─────────────┘  │
│             │                                              │                │
│             ▼                                              │ Blendshapes    │
│  ┌──────────────────────┐                     ┌────────────┴─────────────┐  │
│  │ Longitudinal Medical │                     │ Deterministic Controller │  │
│  │ Intelligence & RAG   │                     │  (Gaze, Saccades, Blink, │  │
│  │ (Creatinine, Labs)   │                     │   Visemes AA/EE/OH/MBP)  │  │
│  └──────────┬───────────┘                     └────────────▲─────────────┘  │
│             │                                              │                │
│             ▼                                              │ Approved text  │
│  ┌──────────────────────┐                     ┌────────────┴─────────────┐  │
│  │ Sovereign Clinical   │ Approved Response   │ Unified Pipeline Service │  │
│  │ Safety Gate (KDIGO)  ├────────────────────►│ (R3F / Convai / D-ID /    │  │
│  │ [Escalate on Danger] │ (State + Evidence)  │  Audio2Face Bridge)      │  │
│  └──────────────────────┘                     └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Safety Gate Escalation Rules:
1. **Direct Medical Advice Interception**: When patient prompts exhibit acute indicators (e.g. `Cr > 3.0 mg/dL`, hyperkalemia, or NSAID + ACEi nephrotoxicity), the safety gate transitions the avatar deterministically to `ALERTING`.
2. **Avatar Behavioral Shift**: Gaze locks directly on the patient, eyebrows furrow downward, reassuring smile is completely suppressed, and urgent escalation directives are displayed on the clinical HUD.
3. **Escalation Notification**: The avatar advises immediate clinical consultation and triggers an escalation event to attending medical staff.

---

## 4. Implemented Source Components

1. **Pipeline Service**: [`avatarPipelineService.ts`](file:///c:/Users/rahul/OneDrive/Desktop/Heal%20Engine/frontend/src/services/avatarPipelineService.ts)
   * Pluggable adapter managing `R3F_NATIVE`, `CONVAI_SDK`, `DID_STREAMING`, and `AUDIO2FACE_BRIDGE`.
   * ARKit 52 morph-target mapper.
   * HIPAA compliance and latency diagnostic tracking.
2. **Avatar State Controller**: [`AvatarStateController.tsx`](file:///c:/Users/rahul/OneDrive/Desktop/Heal%20Engine/frontend/src/components/DigitalHuman/AvatarStateController.tsx)
   * 8 deterministic consultation states with automatic safety gate override.
3. **Lip Sync Controller**: [`LipSyncController.tsx`](file:///c:/Users/rahul/OneDrive/Desktop/Heal%20Engine/frontend/src/components/DigitalHuman/LipSyncController.tsx)
   * Real-time phonetic viseme classifier (`AA`, `EE`, `OH`, `MBP`, `FV`, `LDT`, `SIL`) with smooth temporal lerping.
4. **Expression & Gesture Controllers**:
   * [`ExpressionController.tsx`](file:///c:/Users/rahul/OneDrive/Desktop/Heal%20Engine/frontend/src/components/DigitalHuman/ExpressionController.tsx): Spontaneous 3.2–4.5s physiological blinking, double-blinks, and saccadic eye movements.
   * [`GestureController.tsx`](file:///c:/Users/rahul/OneDrive/Desktop/Heal%20Engine/frontend/src/components/DigitalHuman/GestureController.tsx): 14 breaths/min respiration, active listening nods, and speech head movements.
5. **3D Models & Photorealistic Scenes**:
   * [`Specialist3DScene.tsx`](file:///c:/Users/rahul/OneDrive/Desktop/Heal%20Engine/frontend/src/components/DigitalHuman/Specialist3DScene.tsx) & [`ThreeDSpecialistCanvas.tsx`](file:///c:/Users/rahul/OneDrive/Desktop/Heal%20Engine/frontend/src/components/ThreeDSpecialistCanvas.tsx)
   * Anatomical 3D relief face mesh mapped to high-definition photographic textures (`doc-chen.jpg` and `doc-vance.jpg`).
   * 3D biological eyes with cornea curvature and piercing irises.
   * Articulating mouth cavity and teeth.
6. **Consultation Test Suite**: [`avatarConsultationTestSuite.ts`](file:///c:/Users/rahul/OneDrive/Desktop/Heal%20Engine/backend/tests/avatarConsultationTestSuite.ts)
   * 33 automated tests validating deterministic states, safety gate escalations, phonetic classifications, and persona configurations.

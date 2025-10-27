# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-29_1500-1600_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.086Z<br>
**Decisions in Window**: 2

---

## Statistics

- **Total Prompt Sets**: 2
- **Classified as CODING**: 2 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 367ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759151556857](../../../history/2025-09-29_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1759151556857)

**Time Range**: 1759151556857 → 1759151831655<br>
**LSL File**: [2025-09-29_1500-1600_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1759151556857)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.5525)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/modals/EnhancedProfileModal.tsx
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.5525
- Reasoning: Keyword analysis: 1 matches, score: 4/1
- Processing Time: 1ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1759151978554](../../../history/2025-09-29_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1759151978554)

**Time Range**: 1759151978554 → 1759152079754<br>
**LSL File**: [2025-09-29_1500-1600_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1759151978554)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.769725725)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: //localhost:3002/, //profile-pictures/1364a8f2-7091-704…190c-12b1d22fe13a/1759151764959-cropped-image.jpg, //profile-pictures/1364a8f2-7091-7046-190c-12b1d22fe13a/1759151764959-cropped-image.jpg, //goo.gl/9p2vKq), /[._-]/g,, /src/store/slices/authSlice.ts, /src/App.tsx, /src/components/auth/LoginModal.tsx, /closes\n, /\\S+@\\S+\\.\\S+/.test(formData.email)), /^\\d{6}$/.test(verificationCode)), /last, /src/services/api/apiClient.ts, /refreshToken, /auth/refresh`,, /json, /logout, /mock, /loginUser, /signUpUser, /confirmSignUp, /resendConfirmationCode, /forgotPassword, /resetPassword, /checkAuthStatus, /handlePictureChange, /src/components/modals/EnhancedProfileModal.tsx
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 1ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.769725725
- Reasoning: Semantic similarity favors coding (coding_lsl=0.763, curriculum_alignment=0.748, nano_degree=0.707, coding_infrastructure=0.651)
- Processing Time: 731ms

---


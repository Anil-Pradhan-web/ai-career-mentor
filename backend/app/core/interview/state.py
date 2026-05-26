from enum import Enum


class InterviewState(str, Enum):
    INITIAL = "INITIAL"
    INTRO = "INTRO"                      # Phase 1
    CS_FUNDAMENTALS = "CS_FUNDAMENTALS"  # Phase 2
    LEETCODE = "LEETCODE"                # Phase 3
    PROJECT_DEEPDIVE = "PROJECT_DEEPDIVE"  # Phase 4
    SYSTEM_DESIGN = "SYSTEM_DESIGN"      # Phase 5
    COMPANY_DOMAIN = "COMPANY_DOMAIN"    # Phase 6
    CLOSING = "CLOSING"                  # Phase 7
    FEEDBACK = "FEEDBACK"                # Phase 8 (Answer Q&A + formally conclude)
    COMPLETED = "COMPLETED"


# Map phase integers directly to enum states
PHASE_MAP = {
    1: InterviewState.INTRO,
    2: InterviewState.CS_FUNDAMENTALS,
    3: InterviewState.LEETCODE,
    4: InterviewState.PROJECT_DEEPDIVE,
    5: InterviewState.SYSTEM_DESIGN,
    6: InterviewState.COMPANY_DOMAIN,
    7: InterviewState.CLOSING,
    8: InterviewState.FEEDBACK,
}


class InterviewStateMachine:
    def __init__(self, current_phase: int):
        self.phase = current_phase
        self.state = PHASE_MAP.get(current_phase, InterviewState.COMPLETED)

    def transition_next(self) -> "InterviewStateMachine":
        """Progress the state machine to the next phase."""
        self.phase += 1
        self.state = PHASE_MAP.get(self.phase, InterviewState.COMPLETED)
        return self

    def get_prompt_instruction(self, rolling_memory: str, interview_type: str = "technical") -> str:
        """Returns the specific system instructions injected for the current state."""
        if interview_type == "technical":
            if self.state == InterviewState.INTRO:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 1 (Intro & Discovery). "
                    "Welcome the candidate, confirm the target role, and ask a warm initial question about their technical skills, background, or projects."
                )
            elif self.state == InterviewState.CS_FUNDAMENTALS:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    "CRITICAL INSTRUCTION: You are on Phase 2 (CS Fundamentals). "
                    "First, give brief direct feedback (1-2 sentences) on the candidate's introduction. "
                    "Then, ask a direct question on CS Fundamentals (specifically Operating Systems [OS], Computer Networks [CN], or Database Management Systems [DBMS]) "
                    "based on the focus topic defined in the system prompt. Keep it concise (1-2 sentences)."
                )
            elif self.state == InterviewState.LEETCODE:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    "CRITICAL INSTRUCTION: You are on Phase 3 (LeetCode Coding Challenge). "
                    "First, evaluate the candidate's previous CS fundamentals response briefly (1-2 sentences). "
                    "Then, introduce the coding challenge as described in the system prompt. Explicitly state the LeetCode problem similarity name/number, describe it, and ask the candidate to explain their logic and approach. Stop generating immediately after asking."
                )
            elif self.state == InterviewState.PROJECT_DEEPDIVE:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    "CRITICAL INSTRUCTION: You are on Phase 4 (Project Deep-Dive). "
                    "First, briefly review their LeetCode approach (1-2 sentences). "
                    "Then, ask a deep-dive question about their technical projects. Focus on architectural decisions, bottlenecks, or trade-offs in one of their resume achievements."
                )
            elif self.state == InterviewState.SYSTEM_DESIGN:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    "CRITICAL INSTRUCTION: You are on Phase 5 (System Design). "
                    "First, briefly review their project deep-dive response (1-2 sentences). "
                    "Then, present the system design scenario defined in the system prompt, and ask them to design it from a high-level perspective (caching, database, APIs, load balancing)."
                )
            elif self.state == InterviewState.COMPANY_DOMAIN:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    "CRITICAL INSTRUCTION: You are on Phase 6 (Real-life Domain of the Company's Solution). "
                    "First, briefly evaluate their system design response (1-2 sentences). "
                    "Then, ask a scenario-based question relevant to the company's real-world business and technical domain (e.g. for consultancies like TCS: legacy integration, transaction consistency across systems, or migration strategies; for product/FAANG: low latency, content distribution, or real-time streaming issues)."
                )
            elif self.state == InterviewState.CLOSING:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    "CRITICAL INSTRUCTION: You are on Phase 7 (Closing). "
                    "First, briefly evaluate their domain solution response (1-2 sentences). "
                    "Then, transition to the closing by asking the candidate: 'Do you have any questions for me?'."
                )
            elif self.state == InterviewState.FEEDBACK:
                return (
                    "CRITICAL INSTRUCTION: The candidate has responded to Phase 7 ('Do you have any questions for me?'). "
                    "Please answer their question professionally and concisely (1-3 sentences). "
                    "Then, formally conclude the interview by thanking them and stating that you will now evaluate their performance. Do NOT ask any further questions."
                )
            else:
                return "CRITICAL INSTRUCTION: The interview has concluded. Thank the candidate and stop."
        else:
            # Behavioral Flow Phases
            if self.state == InterviewState.INTRO:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 1 (Behavioral Introduction). "
                    "Welcome the candidate, confirm the target role, and ask them to introduce themselves: 'Tell me about yourself.'"
                )
            elif self.state == InterviewState.CS_FUNDAMENTALS:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 2 (Motivation). "
                    "Respond briefly to their introduction, then ask why they want to work at the company or why they are interested in this role."
                )
            elif self.state == InterviewState.LEETCODE:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 3 (Core Competency). "
                    "Ask a competency/situational question specifically focusing on the core competency topic defined in your system prompt."
                )
            elif self.state == InterviewState.PROJECT_DEEPDIVE:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 4 (Teamwork/Conflict). "
                    "Ask a situational behavioral question about teamwork or handling conflict as defined in your system prompt."
                )
            elif self.state == InterviewState.SYSTEM_DESIGN:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 5 (Challenges/Mistakes). "
                    "Ask a behavioral question about a time they failed, made a major mistake, or missed a deadline, as defined in your system prompt."
                )
            elif self.state == InterviewState.COMPANY_DOMAIN:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 6 (Relocation & Fit). "
                    "Ask them about their relocation preferences and general onboarding details."
                )
            elif self.state == InterviewState.CLOSING:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 7 (Closing). "
                    "Ask the candidate: 'Do you have any questions for me?'."
                )
            elif self.state == InterviewState.FEEDBACK:
                return (
                    "CRITICAL INSTRUCTION: Answer their question professionally and concisely (1-3 sentences). "
                    "Then, formally conclude the interview by thanking them and stating you will now evaluate their performance. Do NOT ask further questions."
                )
            else:
                return "CRITICAL INSTRUCTION: The interview has concluded. Thank the candidate and stop."

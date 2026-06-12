from enum import Enum
from app.core.interview import constants


class InterviewState(str, Enum):
    INITIAL = "INITIAL"
    INTRO = "INTRO"                          # Phase 1
    CORE_THEORY = "CORE_THEORY"              # Phase 2
    HANDS_ON_CHALLENGE = "HANDS_ON_CHALLENGE" # Phase 3
    PAST_EXPERIENCE = "PAST_EXPERIENCE"      # Phase 4
    ARCHITECTURE_DESIGN = "ARCHITECTURE_DESIGN" # Phase 5
    BUSINESS_DOMAIN = "BUSINESS_DOMAIN"      # Phase 6
    CLOSING = "CLOSING"                      # Phase 7
    FEEDBACK = "FEEDBACK"                    # Phase 8 (Answer Q&A + formally conclude)
    COMPLETED = "COMPLETED"


# Map phase integers directly to enum states
PHASE_MAP = {
    1: InterviewState.INTRO,
    2: InterviewState.CORE_THEORY,
    3: InterviewState.HANDS_ON_CHALLENGE,
    4: InterviewState.PAST_EXPERIENCE,
    5: InterviewState.ARCHITECTURE_DESIGN,
    6: InterviewState.BUSINESS_DOMAIN,
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

    def get_prompt_instruction(self, rolling_memory: str, interview_type: str = "technical", role_category: str = "swe") -> str:
        """Returns the specific system instructions injected for the current state."""
        if interview_type == "technical":
            config = constants.ROLE_CATEGORY_CONFIG.get(role_category, constants.ROLE_CATEGORY_CONFIG["swe"])
            p2_topic = config["phase_2_display"]
            p3_name = config["phase_3_display"]
            
            p3_instr = {
                "swe": "Explicitly state the LeetCode problem similarity name/number, describe it, and ask the candidate to explain their logic and approach."
            }.get(role_category, "Present the scenario challenge, and ask the candidate to explain their solution methodology, logic, and key trade-offs.")

            p5_name = config["phase_5_display"]
            p5_focus_text = config["phase_5_focus"]

            if self.state == InterviewState.INTRO:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 1 (Intro & Discovery). "
                    "Welcome the candidate, confirm the target role, and ask a warm initial question about their technical skills, background, or projects."
                )
            elif self.state == InterviewState.CORE_THEORY:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    f"CRITICAL INSTRUCTION: You are on Phase 2 ({p2_topic}). "
                    "First, give brief direct feedback (1-2 sentences) on the candidate's introduction. "
                    f"Then, ask a direct question on {p2_topic} based on the focus topic defined in the system prompt. Keep it concise (1-2 sentences)."
                )
            elif self.state == InterviewState.HANDS_ON_CHALLENGE:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    f"CRITICAL INSTRUCTION: You are on Phase 3 ({p3_name}). "
                    "First, evaluate the candidate's previous fundamentals response briefly (1-2 sentences). "
                    f"Then, introduce the challenge as described in the system prompt. {p3_instr} Stop generating immediately after asking."
                )
            elif self.state == InterviewState.PAST_EXPERIENCE:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    "CRITICAL INSTRUCTION: You are on Phase 4 (Project Deep-Dive). "
                    "First, briefly review their Phase 3 response (1-2 sentences). "
                    "Then, ask a deep-dive question about their technical projects. Focus on architectural decisions, bottlenecks, or trade-offs in one of their resume achievements."
                )
            elif self.state == InterviewState.ARCHITECTURE_DESIGN:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    f"CRITICAL INSTRUCTION: You are on Phase 5 ({p5_name}). "
                    "First, briefly review their project deep-dive response (1-2 sentences). "
                    f"Then, present the system design scenario defined in the system prompt, and ask them to {p5_focus_text}"
                )
            elif self.state == InterviewState.BUSINESS_DOMAIN:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    "CRITICAL INSTRUCTION: You are on Phase 6 (Real-life Domain of the Company's Solution). "
                    "First, briefly evaluate their system design response (1-2 sentences). "
                    "Then, ask a highly realistic, domain-specific business problem and technical solution scenario based on the actual business model and operations of the company (e.g. for Intel: semiconductor fab optimization, edge AI processing, hardware co-design, chip design automation; for FAANG: global scaling, sub-millisecond latency, distributed systems; for Fintech: transactions integrity, compliance, fraud engines). Ask the candidate how they would design a solution using their role's expertise, focusing on practical constraints and technical trade-offs."
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
            elif self.state == InterviewState.CORE_THEORY:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 2 (Motivation). "
                    "Respond briefly to their introduction, then ask why they want to work at the company or why they are interested in this role."
                )
            elif self.state == InterviewState.HANDS_ON_CHALLENGE:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 3 (Core Competency). "
                    "Ask a competency/situational question specifically focusing on the core competency topic defined in your system prompt."
                )
            elif self.state == InterviewState.PAST_EXPERIENCE:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 4 (Teamwork/Conflict). "
                    "Ask a situational behavioral question about teamwork or handling conflict as defined in your system prompt."
                )
            elif self.state == InterviewState.ARCHITECTURE_DESIGN:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 5 (Challenges/Mistakes). "
                    "Ask a behavioral question about a time they failed, made a major mistake, or missed a deadline, as defined in your system prompt."
                )
            elif self.state == InterviewState.BUSINESS_DOMAIN:
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

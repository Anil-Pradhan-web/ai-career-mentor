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

            # ── Category-specific Phase 4/5/6 instructions ────────────────
            CATEGORY_phase_instructions = {
                "swe": {
                    "p4": "You are on Phase 4 (Project Deep-Dive). First, briefly review their Phase 3 response (1-2 sentences). Then, ask a deep-dive question about their technical projects (from their resume or introduction). If no specific project was listed, ask them to describe the most challenging technical project or feature they have built and explain its architecture and bottlenecks.",
                    "p5": "You are on Phase 5 (Low-Level Design & API Design). First, briefly review their project deep-dive response (1-2 sentences). Then, present the LLD scenario defined in the system prompt and ask them to design API endpoints, database schemas, and class structure.",
                    "p6": "You are on Phase 6 (Real-life Domain of Company). First, briefly evaluate their design response (1-2 sentences). Then, present a domain-specific problem based on the company's actual business and ask how they would solve it using their expertise.",
                },
                "data_ai": {
                    "p4": "You are on Phase 4 (ML Project Deep-Dive). First, briefly review their Phase 3 response (1-2 sentences). Then, ask about their ML project: the problem formulation, dataset, model selection reasoning, training pipeline, evaluation metrics, and how they handled overfitting.",
                    "p5": "You are on Phase 5 (ML System Design). First, briefly review their project deep-dive response (1-2 sentences). Then, present the ML system design scenario and ask them to cover data ingestion, feature store, model training, serving infrastructure, and monitoring.",
                    "p6": "You are on Phase 6 (Real-world ML Problem). First, briefly evaluate their ML design response (1-2 sentences). Then, present a domain-specific ML challenge based on the company's actual business and ask them to walk through the full ML lifecycle.",
                },
                "infra_cloud": {
                    "p4": "You are on Phase 4 (Infrastructure Project Deep-Dive). First, briefly review their Phase 3 response (1-2 sentences). Then, ask about their infra/DevOps project: architecture decisions, high availability setup, monitoring, incident response, and any migrations they performed.",
                    "p5": "You are on Phase 5 (Cloud Architecture Design). First, briefly review their project deep-dive response (1-2 sentences). Then, present the cloud architecture scenario and ask them to cover load balancers, autoscaling, network routing, IaC, and disaster recovery.",
                    "p6": "You are on Phase 6 (Real-world Infrastructure Challenge). First, briefly evaluate their architecture response (1-2 sentences). Then, present an infra challenge based on the company's actual operations and ask how they would architect the solution.",
                },
                "security": {
                    "p4": "You are on Phase 4 (Security Project Deep-Dive). First, briefly review their Phase 3 response (1-2 sentences). Then, ask about their security project: threat model built, vulnerabilities discovered, remediation steps, tools used, and how they measured security posture improvement.",
                    "p5": "You are on Phase 5 (Security Architecture Design). First, briefly review their project deep-dive response (1-2 sentences). Then, present the security architecture scenario and ask them to cover threat modeling, auth/authz, data isolation, encryption, and audit logging.",
                    "p6": "You are on Phase 6 (Real-world Security Challenge). First, briefly evaluate their security design response (1-2 sentences). Then, present a security scenario based on the company's actual products and ask how they would approach the threat landscape.",
                },
                "product_design": {
                    "p4": "You are on Phase 4 (Product Project Deep-Dive). First, briefly review their Phase 3 response (1-2 sentences). Then, ask about their product project: metrics tracked, feature prioritization method, user research used, stakeholder alignment, and the outcome/impact.",
                    "p5": "You are on Phase 5 (Product Strategy & Growth). First, briefly review their project deep-dive response (1-2 sentences). Then, present the product strategy scenario and ask them to cover target segments, monetization, key metrics, A/B test design, and launch strategy.",
                    "p6": "You are on Phase 6 (Real-world Product Challenge). First, briefly evaluate their product strategy response (1-2 sentences). Then, present a product challenge based on the company's actual business and ask how they would approach it.",
                },
                "gaming": {
                    "p4": "You are on Phase 4 (Game Project Deep-Dive). First, briefly review their Phase 3 response (1-2 sentences). Then, ask about their game project: game loop architecture, rendering optimizations, physics implementation, multiplayer networking, and memory management.",
                    "p5": "You are on Phase 5 (Game Architecture Design). First, briefly review their project deep-dive response (1-2 sentences). Then, present the game architecture scenario and ask them to cover matchmaking, entity state sync, physics replication, and asset loading.",
                    "p6": "You are on Phase 6 (Real-world Game Challenge). First, briefly evaluate their game design response (1-2 sentences). Then, present a game engineering scenario based on the company's actual products and ask how they would solve it.",
                },
                "specialized": {
                    "p4": "You are on Phase 4 (Domain Project Deep-Dive). First, briefly review their Phase 3 response (1-2 sentences). Then, ask about their specialized project: domain-specific challenges, technical constraints, integration decisions, testing methodology, and reliability measures.",
                    "p5": "You are on Phase 5 (Specialized Architecture Design). First, briefly review their project deep-dive response (1-2 sentences). Then, present the specialized architecture scenario and ask them to cover domain protocols, reliability, scalability, and integration.",
                    "p6": "You are on Phase 6 (Real-world Domain Challenge). First, briefly evaluate their architecture response (1-2 sentences). Then, present a domain challenge based on the company's actual operations and ask how they would apply their expertise.",
                },
            }

            cat_instr = CATEGORY_phase_instructions.get(role_category, CATEGORY_phase_instructions["swe"])

            if self.state == InterviewState.INTRO:
                return (
                    "CRITICAL INSTRUCTION: You are on Phase 1 (Introduction). "
                    "Introduce yourself briefly (first name + role at the company, e.g. 'Hi, I'm Sarah, Senior Engineer at the company'). "
                    "Then welcome the candidate warmly by name and confirm the role they are applying for. "
                    "Then ask them to introduce themselves: 'Tell me about yourself' — their name, background, education, key skills, professional experience, and projects. "
                    "This is a PURE introduction opener like a real interviewer. "
                    "Do NOT ask which skill or area they enjoy most, do NOT dive into any technical depth, and do NOT evaluate their resume yet. "
                    "Keep it warm, natural, and conversational."
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
                    f"CRITICAL INSTRUCTION: {cat_instr['p4']}"
                )
            elif self.state == InterviewState.ARCHITECTURE_DESIGN:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    f"CRITICAL INSTRUCTION: {cat_instr['p5']}"
                )
            elif self.state == InterviewState.BUSINESS_DOMAIN:
                return (
                    f"ROLLING CANDIDATE PROFILE MEMORY: {rolling_memory}\n"
                    f"CRITICAL INSTRUCTION: {cat_instr['p6']}"
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

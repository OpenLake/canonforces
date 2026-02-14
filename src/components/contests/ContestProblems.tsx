import React, { useState, useEffect } from "react";
import { PastContest, ContestProblem } from "../../types/contest-submission";
import { generateProblemsForContest } from "../../utils/generate-contest-problems";
import SolutionSubmitModal from "./SolutionSubmitModal";
import styles from "./ContestProblems.module.css";

interface ContestProblemsProps {
    contest: PastContest;
    onClose: () => void;
}

export default function ContestProblems({ contest, onClose }: ContestProblemsProps) {
    const [problems, setProblems] = useState<ContestProblem[]>([]);
    const [selectedProblem, setSelectedProblem] = useState<ContestProblem | null>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    useEffect(() => {
        // Generate problems for this contest
        const loadProblems = async () => {
            const generatedProblems = await generateProblemsForContest(contest);
            setProblems(generatedProblems);
        };
        loadProblems();
    }, [contest]);

    const handleSubmitSolution = (problem: ContestProblem) => {
        setSelectedProblem(problem);
        setIsSubmitModalOpen(true);
    };

    const handleCloseSubmitModal = () => {
        setIsSubmitModalOpen(false);
        setSelectedProblem(null);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.contestTitle}>{contest.contestName}</h2>
                        <p className={styles.contestMeta}>
                            <span className={styles.platform}>{contest.platform}</span>
                            <span className={styles.separator}>•</span>
                            <span>{problems.length} Problems</span>
                        </p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Problems Grid */}
                <div className={styles.problemsGrid}>
                    {problems.map((problem) => (
                        <div key={problem.problemId} className={styles.problemCard}>
                            <div className={styles.problemHeader}>
                                <h3 className={styles.problemName}>Problem {problem.problemIndex} : {problem.problemName}</h3>
                            </div>

                            <div className={styles.problemActions}>
                                <a
                                    href={problem.problemLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.viewButton}
                                >
                                    View Problem ↗
                                </a>
                                <button
                                    className={styles.submitButton}
                                    onClick={() => handleSubmitSolution(problem)}
                                >
                                    Submit Solution
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Modal */}
                {isSubmitModalOpen && selectedProblem && (
                    <SolutionSubmitModal
                        contest={contest}
                        problem={selectedProblem}
                        onClose={handleCloseSubmitModal}
                    />
                )}
            </div>
        </div>
    );
}

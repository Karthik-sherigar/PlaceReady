const aptitudeQuestions = [
  {
    id: "apt_1",
    question: "If the price of a book is increased by 20% and then decreased by 20%, what is the net change in the price?",
    options: {
      A: "4% decrease",
      B: "4% increase",
      C: "No change",
      D: "8% decrease",
    },
    correctAnswer: "A",
  },
  {
    id: "apt_2",
    question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
    options: {
      A: "120 metres",
      B: "180 metres",
      C: "324 metres",
      D: "150 metres",
    },
    correctAnswer: "D",
  },
  {
    id: "apt_3",
    question: "The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?",
    options: {
      A: "4 years",
      B: "8 years",
      C: "10 years",
      D: "None of the above",
    },
    correctAnswer: "A",
  },
  {
    id: "apt_4",
    question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    options: {
      A: "$0.10",
      B: "$0.05",
      C: "$0.15",
      D: "$1.00",
    },
    correctAnswer: "B",
  },
  {
    id: "apt_5",
    question: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
    options: {
      A: "(1/3)",
      B: "(1/8)",
      C: "(2/8)",
      D: "(1/16)",
    },
    correctAnswer: "B",
  },
  {
    id: "apt_6",
    question: "A and B together can complete a piece of work in 15 days. If A alone can do the same work in 20 days, in how many days can B alone complete the work?",
    options: {
      A: "60 days",
      B: "45 days",
      C: "40 days",
      D: "30 days",
    },
    correctAnswer: "A",
  },
  {
    id: "apt_7",
    question: "Which word does NOT belong with the others?",
    options: {
      A: "Tulip",
      B: "Rose",
      C: "Bud",
      D: "Daisy",
    },
    correctAnswer: "C",
  },
  {
    id: "apt_8",
    question: "Odometer is to mileage as compass is to:",
    options: {
      A: "Speed",
      B: "Hiking",
      C: "Needle",
      D: "Direction",
    },
    correctAnswer: "D",
  },
  {
    id: "apt_9",
    question: "If A is the brother of B; B is the sister of C; and C is the father of D, how D is related to A?",
    options: {
      A: "Brother",
      B: "Sister",
      C: "Nephew",
      D: "Cannot be determined",
    },
    correctAnswer: "D",
  },
  {
    id: "apt_10",
    question: "What is the next prime number after 31?",
    options: {
      A: "33",
      B: "35",
      C: "37",
      D: "39",
    },
    correctAnswer: "C",
  },
];

const dsaQuestions = [
  {
    id: "dsa_1",
    question: "What is the time complexity of searching an element in an unsorted array?",
    options: {
      A: "O(1)",
      B: "O(log n)",
      C: "O(n)",
      D: "O(n log n)",
    },
    correctAnswer: "C",
  },
  {
    id: "dsa_2",
    question: "Which data structure uses LIFO (Last In First Out)?",
    options: {
      A: "Queue",
      B: "Stack",
      C: "Tree",
      D: "Graph",
    },
    correctAnswer: "B",
  },
  {
    id: "dsa_3",
    question: "In worst case, QuickSort has a time complexity of:",
    options: {
      A: "O(n log n)",
      B: "O(n^2)",
      C: "O(n)",
      D: "O(log n)",
    },
    correctAnswer: "B",
  },
  {
    id: "dsa_4",
    question: "Which of the following sorting algorithms is stable by default?",
    options: {
      A: "Merge Sort",
      B: "Quick Sort",
      C: "Heap Sort",
      D: "Selection Sort",
    },
    correctAnswer: "A",
  },
  {
    id: "dsa_5",
    question: "What data structure is typically used to implement recursion?",
    options: {
      A: "Queue",
      B: "Stack",
      C: "Linked List",
      D: "Tree",
    },
    correctAnswer: "B",
  },
  {
    id: "dsa_6",
    question: "What is the worst-case time complexity for inserting an element into a Binary Search Tree (BST)?",
    options: {
      A: "O(1)",
      B: "O(log n)",
      C: "O(n)",
      D: "O(n log n)",
    },
    correctAnswer: "C",
  },
  {
    id: "dsa_7",
    question: "A graph without cycles is called a:",
    options: {
      A: "Cyclic Graph",
      B: "Directed Graph",
      C: "Tree",
      D: "Bipartite Graph",
    },
    correctAnswer: "C",
  },
  {
    id: "dsa_8",
    question: "Which data structure is most efficient for implementing a priority queue?",
    options: {
      A: "Array",
      B: "Linked List",
      C: "Heap",
      D: "Stack",
    },
    correctAnswer: "C",
  },
  {
    id: "dsa_9",
    question: "What is the space complexity of an adjacency matrix for a graph with V vertices?",
    options: {
      A: "O(V)",
      B: "O(V^2)",
      C: "O(E)",
      D: "O(V + E)",
    },
    correctAnswer: "B",
  },
  {
    id: "dsa_10",
    question: "Which algorithm is used to find the shortest path from a single source in a weighted graph?",
    options: {
      A: "Kruskal's Algorithm",
      B: "Prim's Algorithm",
      C: "Dijkstra's Algorithm",
      D: "Depth First Search",
    },
    correctAnswer: "C",
  },
];

const communicationPrompts = [
  {
    id: "comm_1",
    prompt: "Tell me about a time when you faced a difficult problem in a project. How did you approach solving it?",
    evaluationCriteria: "Evaluates problem-solving methodology, clarity of thought, structured explanation (e.g., STAR method), and articulation of the specific steps taken to overcome the challenge.",
  },
  {
    id: "comm_2",
    prompt: "Describe a situation where you had a disagreement with a team member. How did you resolve it?",
    evaluationCriteria: "Evaluates conflict resolution skills, empathy, professional communication, and the ability to find a constructive, mutually beneficial outcome without resorting to personal attacks.",
  },
  {
    id: "comm_3",
    prompt: "Why are you interested in pursuing a career in software engineering?",
    evaluationCriteria: "Evaluates intrinsic motivation, passion for the field, clarity of career goals, and ability to articulate personal interest convincingly.",
  },
  {
    id: "comm_4",
    prompt: "Explain a complex technical concept you recently learned to someone who has no technical background.",
    evaluationCriteria: "Evaluates the ability to simplify complex ideas, avoid jargon, use appropriate analogies, and communicate clearly to a non-technical audience.",
  },
  {
    id: "comm_5",
    prompt: "What is your greatest strength, and how has it helped you in your academic or professional life?",
    evaluationCriteria: "Evaluates self-awareness, relevance of the strength to the professional context, and the ability to provide concrete examples demonstrating the strength in action.",
  },
  {
    id: "comm_6",
    prompt: "Tell me about a time you failed or made a significant mistake. What did you learn from it?",
    evaluationCriteria: "Evaluates accountability, resilience, growth mindset, and the ability to extract valuable lessons from setbacks rather than just dwelling on the failure.",
  },
  {
    id: "comm_7",
    prompt: "Describe a project you are most proud of. What was your specific contribution?",
    evaluationCriteria: "Evaluates ability to clearly articulate technical contributions, enthusiasm for one's work, and the ability to differentiate individual effort within a team context.",
  },
  {
    id: "comm_8",
    prompt: "How do you prioritize your work when you have multiple deadlines approaching?",
    evaluationCriteria: "Evaluates time management skills, organizational strategies, ability to handle pressure, and logical reasoning for task prioritization.",
  },
  {
    id: "comm_9",
    prompt: "Tell me about a time you had to quickly learn a new technology or skill to complete a task.",
    evaluationCriteria: "Evaluates adaptability, learning agility, resourcefulness, and the proactive approach taken to acquire new knowledge under time constraints.",
  },
  {
    id: "comm_10",
    prompt: "Where do you see yourself professionally in five years?",
    evaluationCriteria: "Evaluates ambition, alignment of long-term goals with the targeted roles, realistic career planning, and commitment to continuous growth.",
  },
];

module.exports = {
  aptitudeQuestions,
  dsaQuestions,
  communicationPrompts,
};

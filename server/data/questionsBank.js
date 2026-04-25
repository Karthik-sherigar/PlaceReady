const aptitudeQuestions = [
  // Easy (1-3)
  {
    id: "apt_1",
    question: "If 20% of a number is 50, what is the number?",
    options: {
      A: "100",
      B: "200",
      C: "250",
      D: "300",
    },
    correctAnswer: "C",
  },
  {
    id: "apt_2",
    question: "The ratio of boys to girls in a class is 3:2. If there are 30 boys, how many girls are there?",
    options: {
      A: "15",
      B: "20",
      C: "25",
      D: "30",
    },
    correctAnswer: "B",
  },
  {
    id: "apt_3",
    question: "Find the next number in the series: 2, 6, 12, 20, 30, ...",
    options: {
      A: "36",
      B: "40",
      C: "42",
      D: "48",
    },
    correctAnswer: "C",
  },
  // Medium (4-7)
  {
    id: "apt_4",
    question: "A train traveling at 60 km/hr crosses a 200m long platform in 27 seconds. What is the length of the train?",
    options: {
      A: "200m",
      B: "240m",
      C: "250m",
      D: "300m",
    },
    correctAnswer: "C",
  },
  {
    id: "apt_5",
    question: "A shopkeeper sells an item for $120, making a 20% profit. What was the cost price?",
    options: {
      A: "$80",
      B: "$96",
      C: "$100",
      D: "$144",
    },
    correctAnswer: "C",
  },
  {
    id: "apt_6",
    question: "If 'A + B' means A is the brother of B; 'A x B' means A is the father of B. What does 'P + Q x R' mean?",
    options: {
      A: "P is the brother of R",
      B: "P is the uncle of R",
      C: "P is the son of R",
      D: "P is the nephew of R",
    },
    correctAnswer: "B",
  },
  {
    id: "apt_7",
    question: "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:",
    options: {
      A: "1/4",
      B: "1/10",
      C: "7/15",
      D: "8/15",
    },
    correctAnswer: "D",
  },
  // Hard (8-10)
  {
    id: "apt_8",
    question: "A bag contains 5 red, 4 green, and 3 blue balls. If two balls are drawn at random, what is the probability that both are red?",
    options: {
      A: "5/33",
      B: "10/33",
      C: "5/22",
      D: "1/6",
    },
    correctAnswer: "A",
  },
  {
    id: "apt_9",
    question: "Find the odd one out: 3, 5, 11, 14, 17, 21",
    options: {
      A: "21",
      B: "17",
      C: "14",
      D: "3",
    },
    correctAnswer: "C",
  },
  {
    id: "apt_10",
    question: "In a race of 1000m, A beats B by 100m and beats C by 200m. By how many meters does B beat C in the same race?",
    options: {
      A: "100m",
      B: "111.1m",
      C: "120m",
      D: "125m",
    },
    correctAnswer: "B",
  },
];

const dsaQuestions = [
  // Easy (1-3)
  {
    id: "dsa_1",
    question: "What is the output of the following array operation? arr = [1, 2, 3]; arr.push(4); arr.pop(); return arr.length;",
    options: {
      A: "2",
      B: "3",
      C: "4",
      D: "Undefined",
    },
    correctAnswer: "B",
  },
  {
    id: "dsa_2",
    question: "Which of the following data structures is best for implementing an Undo feature?",
    options: {
      A: "Queue",
      B: "Tree",
      C: "Stack",
      D: "Graph",
    },
    correctAnswer: "C",
  },
  {
    id: "dsa_3",
    question: "In a linked list, each node contains:",
    options: {
      A: "Only data",
      B: "Data and a reference to the next node",
      C: "Only a reference to the next node",
      D: "Data and an index",
    },
    correctAnswer: "B",
  },
  // Medium (4-6)
  {
    id: "dsa_4",
    question: "Which sorting algorithm is most efficient for an array that is already almost sorted?",
    options: {
      A: "Quick Sort",
      B: "Merge Sort",
      C: "Insertion Sort",
      D: "Selection Sort",
    },
    correctAnswer: "C",
  },
  {
    id: "dsa_5",
    question: "What is the worst-case time complexity of finding a specific element in a Hash Table with many collisions?",
    options: {
      A: "O(1)",
      B: "O(log N)",
      C: "O(N)",
      D: "O(N^2)",
    },
    correctAnswer: "C",
  },
  {
    id: "dsa_6",
    question: "Which data structure is typically used for breadth-first traversal of a graph?",
    options: {
      A: "Stack",
      B: "Queue",
      C: "Priority Queue",
      D: "Array",
    },
    correctAnswer: "B",
  },
  // Problem Statement (7-8)
  {
    id: "dsa_7",
    question: "Given an array of integers, you need to find the contiguous subarray with the largest sum. Which approach provides an O(N) time complexity solution?",
    options: {
      A: "Checking every possible subarray sum using nested loops",
      B: "Sorting the array first, then summing adjacent positive numbers",
      C: "Using Kadane's Algorithm to maintain a running maximum sum",
      D: "Using Binary Search to find the optimal boundaries",
    },
    correctAnswer: "C",
  },
  {
    id: "dsa_8",
    question: "You need to determine if a string has balanced parentheses (e.g., '({[]})' is balanced, '([)]' is not). What is the optimal data structure and time complexity?",
    options: {
      A: "Array, O(N^2)",
      B: "Hash Map, O(1)",
      C: "Queue, O(N)",
      D: "Stack, O(N)",
    },
    correctAnswer: "D",
  },
  // Hard (9-10)
  {
    id: "dsa_9",
    question: "Which algorithm can efficiently find the shortest path in a weighted graph that contains negative edge weights (but no negative cycles)?",
    options: {
      A: "Dijkstra's Algorithm",
      B: "Bellman-Ford Algorithm",
      C: "Kruskal's Algorithm",
      D: "Prim's Algorithm",
    },
    correctAnswer: "B",
  },
  {
    id: "dsa_10",
    question: "To implement an LRU (Least Recently Used) cache with O(1) operations for get and put, which combination of data structures is required?",
    options: {
      A: "Array and Binary Search Tree",
      B: "Stack and Queue",
      C: "Hash Map and Doubly Linked List",
      D: "Hash Map and Min-Heap",
    },
    correctAnswer: "C",
  },
];

const communicationPrompts = [
  {
    id: "comm_1",
    prompt: "Self introduction — tell us about yourself and your background.",
    evaluationCriteria: "Evaluate clarity of introduction, mention of technical skills or education, confidence in tone, relevance to software engineering roles, and overall communication quality. Evaluate clarity of expression, logical structure, and coherence of the spoken response as transcribed. Penalize fragmented, incoherent, or very short responses.",
  },
  {
    id: "comm_2",
    prompt: "Describe a technical project you built end to end.",
    evaluationCriteria: "Evaluate the ability to clearly describe architecture, technologies used, challenges faced, and the specific personal contributions made. Look for structure and logical flow. Evaluate clarity of expression, logical structure, and coherence of the spoken response as transcribed. Penalize fragmented, incoherent, or very short responses.",
  },
  {
    id: "comm_3",
    prompt: "How do you handle a deadline you realize you cannot meet?",
    evaluationCriteria: "Evaluate professional maturity, proactive communication, prioritization strategies, and problem-solving mindset. High score for proposing solutions or scope adjustments rather than just panicking. Evaluate clarity of expression, logical structure, and coherence of the spoken response as transcribed. Penalize fragmented, incoherent, or very short responses.",
  },
  {
    id: "comm_4",
    prompt: "Explain what a REST API is to a non-technical person.",
    evaluationCriteria: "Evaluate the ability to use clear, simple analogies. Penalize heavy use of technical jargon. High score for analogies like 'a waiter in a restaurant' or similar easily understood concepts. Evaluate clarity of expression, logical structure, and coherence of the spoken response as transcribed. Penalize fragmented, incoherent, or very short responses.",
  },
  {
    id: "comm_5",
    prompt: "Describe a conflict in a team and how you resolved it.",
    evaluationCriteria: "Evaluate conflict resolution skills, empathy, emotional intelligence, and focus on collaborative outcomes. Penalize answers that blame others or avoid the question. Evaluate clarity of expression, logical structure, and coherence of the spoken response as transcribed. Penalize fragmented, incoherent, or very short responses.",
  },
  {
    id: "comm_6",
    prompt: "Why do you want to work in software development?",
    evaluationCriteria: "Evaluate intrinsic motivation, passion for problem-solving, and alignment with industry realities. Look for specific, genuine reasons beyond 'it pays well'. Evaluate clarity of expression, logical structure, and coherence of the spoken response as transcribed. Penalize fragmented, incoherent, or very short responses.",
  },
  {
    id: "comm_7",
    prompt: "What is your biggest technical weakness and how are you improving it?",
    evaluationCriteria: "Evaluate self-awareness and continuous learning mindset. A good answer provides a real weakness and concrete, actionable steps being taken to improve it. Evaluate clarity of expression, logical structure, and coherence of the spoken response as transcribed. Penalize fragmented, incoherent, or very short responses.",
  },
  {
    id: "comm_8",
    prompt: "Describe your approach when you encounter a bug you cannot find.",
    evaluationCriteria: "Evaluate systematic debugging strategies (e.g., rubber ducking, isolating components, checking logs, stepping through code) and resourcefulness (asking for help, reading documentation). Evaluate clarity of expression, logical structure, and coherence of the spoken response as transcribed. Penalize fragmented, incoherent, or very short responses.",
  },
  {
    id: "comm_9",
    prompt: "How do you prioritize tasks when multiple things feel urgent?",
    evaluationCriteria: "Evaluate time management skills, understanding of impact vs. effort, and the ability to negotiate priorities with stakeholders. Evaluate clarity of expression, logical structure, and coherence of the spoken response as transcribed. Penalize fragmented, incoherent, or very short responses.",
  },
  {
    id: "comm_10",
    prompt: "Where do you see yourself professionally in 3 years?",
    evaluationCriteria: "Evaluate ambition, realistic career progression goals, and focus on technical growth or leadership within the software engineering domain. Evaluate clarity of expression, logical structure, and coherence of the spoken response as transcribed. Penalize fragmented, incoherent, or very short responses.",
  },
];

module.exports = {
  aptitudeQuestions,
  dsaQuestions,
  communicationPrompts,
};

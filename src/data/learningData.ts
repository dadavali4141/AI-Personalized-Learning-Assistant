import { Subject, QuizQuestion } from '../types';

export const subjects: Subject[] = [
  {
    id: 'Python',
    name: 'Python Programming',
    short: 'Python',
    icon: '⌘',
    color: 'purple',
    level: 'Beginner',
    desc: 'Build confidence with syntax, data types, loops, functions, and algorithmic problem solving.',
    topics: ['Variables', 'Data types', 'Loops', 'Functions', 'Strings', 'Exceptions', 'Lambdas'],
    minutes: 25,
    learningObjectives: [
      'Master fundamental syntax, indentation, and variable assignments',
      'Understand mutable lists vs immutable tuples and key-value dictionaries',
      'Implement defensive control flow with try/except exception blocks',
      'Write reusable functions, lambda expressions, and list comprehensions'
    ],
    keyConcept: 'Python emphasizes readability through whitespace indentation. Core built-in structures include lists (dynamic ordered arrays), dictionaries (hash maps with O(1) average lookup), sets (unique hashable values), and tuples (fixed sequences). Functions are first-class citizens and can be passed as arguments or returned.',
    codeSnippet: `# Python Function & List Comprehension Example
def filter_high_scores(scores: list[int], threshold: int = 75) -> list[int]:
    """Returns scores equal to or above the threshold."""
    return [score for score in scores if score >= threshold]

# Example usage
quiz_results = [65, 88, 92, 54, 78, 100]
top_performers = filter_high_scores(quiz_results)
print("Top Scores:", top_performers) # [88, 92, 78, 100]`
  },
  {
    id: 'Java',
    name: 'Java Programming',
    short: 'Java',
    icon: '☕',
    color: 'gold',
    level: 'Intermediate',
    desc: 'Practice object-oriented concepts, classes, inheritance, polymorphism, and core Java syntax.',
    topics: ['OOP basics', 'Classes', 'Inheritance', 'Exceptions', 'Polymorphism', 'Overloading'],
    minutes: 30,
    learningObjectives: [
      'Understand JVM bytecode execution and strongly-typed compilation',
      'Implement the four pillars of OOP: Encapsulation, Abstraction, Inheritance, Polymorphism',
      'Distinguish between method overloading (compile-time) and overriding (runtime)',
      'Manage memory lifecycles and garbage collection in enterprise architectures'
    ],
    keyConcept: 'Java is an object-oriented, class-based language compiled to bytecode running on the Java Virtual Machine (JVM). Every method belongs to a class, and execution begins at public static void main(String[] args). Polymorphism enables an interface or superclass reference to invoke overridden implementations at runtime.',
    codeSnippet: `// Java Object-Oriented Hierarchy Example
public class StudentRecord {
    private final String studentId;
    private int completedCredits;

    public StudentRecord(String studentId, int initialCredits) {
        this.studentId = studentId;
        this.completedCredits = initialCredits;
    }

    public void addCredits(int credits) {
        if (credits > 0) {
            this.completedCredits += credits;
        }
    }

    public static void main(String[] args) {
        StudentRecord student = new StudentRecord("CS-2026-041", 45);
        student.addCredits(15);
        System.out.println("Credits: " + student.completedCredits);
    }
}`
  },
  {
    id: 'DBMS',
    name: 'Database Management Systems (DBMS)',
    short: 'DBMS',
    icon: '▤',
    color: 'cyan',
    level: 'Intermediate',
    desc: 'Strengthen database fundamentals, SQL queries, relational keys, ACID transactions, and normalization.',
    topics: ['SQL', 'Keys', 'Normalization', 'Joins', 'Transactions', 'ACID'],
    minutes: 30,
    learningObjectives: [
      'Write multi-table SQL queries with INNER, LEFT, and aggregate GROUP BY operations',
      'Enforce primary keys, foreign keys, and referential integrity constraints',
      'Normalize tables from 1NF to 3NF/BCNF to prevent update and deletion anomalies',
      'Understand the ACID transaction guarantees: Atomicity, Consistency, Isolation, Durability'
    ],
    keyConcept: 'A DBMS provides systematic data persistence with integrity constraints. Relational DBMS models data into tables of rows and columns. Normalization eliminates data redundancy and update anomalies. Transactions ensure ACID guarantees so that atomic batches succeed completely or rollback without leaving corrupted states.',
    codeSnippet: `-- SQL Relational Query with Aggregate Join
SELECT 
    s.subject_name,
    COUNT(q.quiz_id) AS attempts_count,
    ROUND(AVG(q.score_percent), 2) AS average_score
FROM subjects s
INNER JOIN quiz_attempts q ON s.subject_id = q.subject_id
WHERE q.created_at >= '2026-01-01'
GROUP BY s.subject_name
HAVING AVG(q.score_percent) >= 70.0
ORDER BY average_score DESC;`
  },
  {
    id: 'Computer Networks',
    name: 'Computer Networks',
    short: 'Networks',
    icon: '⌘',
    color: 'teal',
    level: 'Intermediate',
    desc: 'Explore network architecture, OSI 7-layer model, TCP/IP protocols, IP addressing, and secure HTTPS.',
    topics: ['OSI model', 'TCP/IP', 'IP addressing', 'Protocols', 'DNS', 'HTTPS'],
    minutes: 25,
    learningObjectives: [
      'Trace packet movement across the 7 OSI layers and 4 TCP/IP layers',
      'Contrast reliable, connection-oriented TCP (three-way handshake) with lightweight UDP',
      'Distinguish public IPv4 addresses from private subnets (RFC 1918) and CIDR prefixes',
      'Understand DNS resolution hierarchies and TLS handshake encryption in HTTPS'
    ],
    keyConcept: 'Computer networks connect disparate systems through layered protocol stacks. The Physical and Data Link layers transmit bits and frames between adjacent hardware nodes; Network layer routers route packets across IP subnets; Transport protocols (TCP/UDP) manage process-to-process communication; and Application protocols (HTTP/DNS) power end-user software.',
    codeSnippet: `/* TCP 3-Way Handshake Flow:
   Client                     Server
     | ------ SYN (seq=x) ------> |
     | <-- SYN-ACK (seq=y,ack=x+1)|
     | ------ ACK (ack=y+1) ----> |  (Connection Established)

   DNS Resolution Flow:
   Browser -> Recursive Resolver -> Root Server -> TLD Server (.com) -> Authoritative Nameserver -> IP Address
*/`
  },
  {
    id: 'Operating Systems',
    name: 'Operating Systems',
    short: 'OS',
    icon: '▧',
    color: 'purple',
    level: 'Advanced',
    desc: 'Understand processes, CPU scheduling algorithms, virtual memory, paging, and deadlock handling.',
    topics: ['Processes', 'Scheduling', 'Memory', 'Deadlocks', 'Virtual Memory', 'Round Robin'],
    minutes: 35,
    learningObjectives: [
      'Differentiate between processes (isolated address space) and threads (shared memory)',
      'Analyze CPU scheduling algorithms: First-Come First-Served, Shortest Job First, Round Robin',
      'Explain virtual memory paging, page tables, TLB cache, and page fault replacement',
      'Identify the four Coffman deadlock conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait'
    ],
    keyConcept: 'An Operating System acts as an intermediary between user applications and bare hardware. It orchestrates CPU time through preemptive scheduling, protects physical RAM by mapping process virtual addresses to page frames, and provides system calls for file I/O, device management, and inter-process communication.',
    codeSnippet: `// POSIX Fork & Exec Process Creation Lifecycle
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork(); // Creates child process
    if (pid < 0) {
        perror("Fork failed");
        return 1;
    } else if (pid == 0) {
        // Child process execution
        printf("Child Process ID: %d\\n", getpid());
        execlp("/bin/ls", "ls", "-l", NULL);
    } else {
        // Parent process waits for child completion
        wait(NULL);
        printf("Parent Process acknowledged child termination.\\n");
    }
    return 0;
}`
  },
  {
    id: 'Data Structures',
    name: 'Data Structures and Algorithms',
    short: 'DSA',
    icon: '⌗',
    color: 'blue',
    level: 'Intermediate',
    desc: 'Improve algorithmic thinking with arrays, stacks, queues, binary search trees, searching, and traversal.',
    topics: ['Arrays', 'Stacks', 'Queues', 'Searching', 'Trees', 'Graphs', 'Binary Search'],
    minutes: 30,
    learningObjectives: [
      'Compare time and space complexities using Big-O asymptotic notation',
      'Utilize LIFO stacks for recursion/backtracking and FIFO queues for BFS exploration',
      'Implement binary search on sorted sequences to achieve O(log n) search performance',
      'Traverse Binary Search Trees (Inorder yields sorted elements) and build graphs'
    ],
    keyConcept: 'Data structures organize data in memory to enable efficient computation. Choosing between an array (O(1) random access), linked list (O(1) insertion at pointer), hash table (O(1) average lookup), or binary search tree (O(log n) ordered lookup) determines overall system scalability.',
    codeSnippet: `// TypeScript Binary Search Implementation: O(log n)
function binarySearch(arr: number[], target: number): number {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        if (arr[mid] === target) return mid; // Found target index
        if (arr[mid] < target) {
            left = mid + 1; // Search right half
        } else {
            right = mid - 1; // Search left half
        }
    }
    return -1; // Target not present
}`
  }
];

// Complete preserved 39 quiz questions from original app.js
export const questionBank: QuizQuestion[] = [
  { s: "Python", d: "Beginner", q: "Which keyword defines a function in Python?", o: ["func", "def", "function", "define"], a: 1, e: "Python uses the def keyword to start a function definition.", topic: "Functions" },
  { s: "Python", d: "Beginner", q: "Which data type stores key-value pairs?", o: ["List", "Tuple", "Set", "Dictionary"], a: 3, e: "A dictionary maps unique keys to values.", topic: "Data types" },
  { s: "Python", d: "Beginner", q: "Which symbol starts a single-line Python comment?", o: ["//", "#", "/*", "--"], a: 1, e: "The hash symbol (#) begins a Python comment.", topic: "Syntax" },
  { s: "Python", d: "Beginner", q: "What is the result of len('learn')?", o: ["4", "5", "6", "Error"], a: 1, e: "The string contains five characters.", topic: "Strings" },
  { s: "Python", d: "Beginner", q: "Which collection is ordered and changeable?", o: ["Tuple", "Set", "List", "Frozen set"], a: 2, e: "Lists preserve order and can be modified.", topic: "Data types" },
  { s: "Python", d: "Intermediate", q: "What does range(3) produce when iterated?", o: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3 only"], a: 1, e: "range(3) produces 0, 1, and 2; stop is excluded.", topic: "Loops" },
  { s: "Python", d: "Intermediate", q: "Which statement handles an exception?", o: ["catch", "error", "try/except", "check"], a: 2, e: "Python uses try and except to handle exceptions.", topic: "Exceptions" },
  { s: "Python", d: "Advanced", q: "What is a lambda in Python?", o: ["A loop", "An anonymous function expression", "A module", "A class constructor"], a: 1, e: "A lambda creates a small anonymous function expression.", topic: "Functions" },
  { s: "Java", d: "Beginner", q: "Which keyword declares a class in Java?", o: ["object", "define", "class", "struct"], a: 2, e: "The class keyword declares a class.", topic: "Classes" },
  { s: "Java", d: "Beginner", q: "What is the usual entry point of a Java application?", o: ["start()", "main()", "runApp()", "init()"], a: 1, e: "The main method is the conventional entry point.", topic: "Syntax" },
  { s: "Java", d: "Beginner", q: "Which type stores true or false?", o: ["int", "char", "boolean", "String"], a: 2, e: "The boolean primitive represents true or false.", topic: "Data types" },
  { s: "Java", d: "Intermediate", q: "What is inheritance?", o: ["Hiding methods", "A class acquiring features from another class", "Deleting objects", "Machine code"], a: 1, e: "Inheritance lets a class derive fields and methods from another class.", topic: "Inheritance" },
  { s: "Java", d: "Intermediate", q: "Which keyword creates an object in Java?", o: ["new", "this", "make", "create"], a: 0, e: "The new keyword allocates and constructs an object.", topic: "Objects" },
  { s: "Java", d: "Advanced", q: "Which concept allows one interface to have multiple implementations?", o: ["Encapsulation", "Polymorphism", "Compilation", "Casting"], a: 1, e: "Polymorphism allows a common interface to represent different implementations.", topic: "OOP" },
  { s: "DBMS", d: "Beginner", q: "What does DBMS stand for?", o: ["Data Backup Management Service", "Database Management System", "Digital Base Memory Setup", "Database Machine Software"], a: 1, e: "DBMS means Database Management System.", topic: "Fundamentals" },
  { s: "DBMS", d: "Beginner", q: "Which SQL command retrieves records?", o: ["GET", "OPEN", "SELECT", "FETCHTABLE"], a: 2, e: "SELECT retrieves data from database tables.", topic: "SQL" },
  { s: "DBMS", d: "Beginner", q: "What is a primary key?", o: ["A key that repeats", "A field that uniquely identifies each row", "A password", "A duplicate column"], a: 1, e: "A primary key uniquely identifies each record.", topic: "Keys" },
  { s: "DBMS", d: "Intermediate", q: "What is the main purpose of normalization?", o: ["Add duplicate data", "Reduce redundancy and update anomalies", "Encrypt columns", "Speed up typing"], a: 1, e: "Normalization reduces unnecessary duplication and anomalies.", topic: "Normalization" },
  { s: "DBMS", d: "Intermediate", q: "Which JOIN returns rows matching in both tables?", o: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "CROSS JOIN"], a: 2, e: "INNER JOIN returns rows where the join condition matches in both tables.", topic: "Joins" },
  { s: "DBMS", d: "Advanced", q: "Which ACID property means all-or-nothing?", o: ["Consistency", "Isolation", "Durability", "Atomicity"], a: 3, e: "Atomicity ensures a transaction completes fully or has no effect.", topic: "Transactions" },
  { s: "Computer Networks", d: "Beginner", q: "How many layers are in the OSI reference model?", o: ["4", "5", "7", "8"], a: 2, e: "The OSI reference model has seven layers.", topic: "OSI model" },
  { s: "Computer Networks", d: "Beginner", q: "Which device forwards packets between networks?", o: ["Hub", "Router", "Repeater", "Keyboard"], a: 1, e: "Routers forward packets between networks.", topic: "Devices" },
  { s: "Computer Networks", d: "Intermediate", q: "Which protocol provides reliable connection-oriented transport?", o: ["UDP", "IP", "TCP", "ARP"], a: 2, e: "TCP provides reliable, ordered, connection-oriented delivery.", topic: "TCP/IP" },
  { s: "Computer Networks", d: "Intermediate", q: "What does DNS primarily do?", o: ["Encrypt files", "Translate domain names to IP addresses", "Assign MAC addresses", "Compress images"], a: 1, e: "DNS resolves domain names to records, commonly IP addresses.", topic: "Protocols" },
  { s: "Computer Networks", d: "Advanced", q: "Which address is in a private IPv4 range?", o: ["8.8.8.8", "172.20.10.5", "1.1.1.1", "203.0.113.9"], a: 1, e: "172.16.0.0 through 172.31.255.255 is a private range.", topic: "IP addressing" },
  { s: "Operating Systems", d: "Beginner", q: "What is the primary role of an operating system?", o: ["Only create presentations", "Manage hardware and software resources", "Only browse websites", "Replace the CPU"], a: 1, e: "An OS manages system resources and provides services to applications.", topic: "Fundamentals" },
  { s: "Operating Systems", d: "Beginner", q: "A program in execution is called a:", o: ["Process", "Folder", "Compiler", "Protocol"], a: 0, e: "A process is a program currently being executed.", topic: "Processes" },
  { s: "Operating Systems", d: "Intermediate", q: "Which scheduling algorithm uses a fixed time slice?", o: ["FCFS only", "Round Robin", "SJF only", "Priority only"], a: 1, e: "Round Robin gives each ready process a time quantum.", topic: "Scheduling" },
  { s: "Operating Systems", d: "Advanced", q: "Which is a necessary condition for deadlock?", o: ["Compilation", "Circular wait", "Code reuse", "Caching"], a: 1, e: "Circular wait is one of the four Coffman conditions.", topic: "Deadlocks" },
  { s: "Data Structures", d: "Beginner", q: "Which data structure follows LIFO order?", o: ["Queue", "Stack", "Graph", "Array only"], a: 1, e: "A stack follows Last In, First Out.", topic: "Stacks" },
  { s: "Data Structures", d: "Beginner", q: "Which data structure follows FIFO order?", o: ["Stack", "Tree", "Queue", "Heap"], a: 2, e: "A queue follows First In, First Out.", topic: "Queues" },
  { s: "Data Structures", d: "Intermediate", q: "What is binary search time complexity on a sorted array?", o: ["O(n)", "O(log n)", "O(n²)", "Always O(1)"], a: 1, e: "Binary search halves the search interval each step.", topic: "Searching" },
  { s: "Data Structures", d: "Intermediate", q: "Which structure commonly represents hierarchical data?", o: ["Tree", "Queue", "Stack only", "Hash only"], a: 0, e: "Trees represent parent-child relationships.", topic: "Trees" },
  { s: "Data Structures", d: "Advanced", q: "Which BST traversal visits keys in sorted order?", o: ["Preorder", "Postorder", "Inorder", "Level-order only"], a: 2, e: "Inorder visits left subtree, node, then right subtree.", topic: "Trees" },
  { s: "Python", d: "Advanced", q: "Which built-in structure guarantees unique elements?", o: ["List", "Tuple", "Set", "String"], a: 2, e: "A set stores unique elements.", topic: "Data types" },
  { s: "Java", d: "Advanced", q: "What is method overloading?", o: ["Same method name with different parameter lists", "A class extending two classes", "Calling a method often", "Deleting a method"], a: 0, e: "Overloading defines methods with the same name but different parameter lists.", topic: "Polymorphism" },
  { s: "DBMS", d: "Advanced", q: "What does a foreign key help enforce?", o: ["Image quality", "Referential integrity between tables", "Password complexity", "Sorting speed"], a: 1, e: "Foreign keys help maintain valid relationships between tables.", topic: "Keys" },
  { s: "Computer Networks", d: "Advanced", q: "Which protocol is commonly used to securely access websites?", o: ["HTTP", "HTTPS", "FTP only", "SMTP"], a: 1, e: "HTTPS uses TLS to protect browser-to-website communication.", topic: "Protocols" },
  { s: "Operating Systems", d: "Intermediate", q: "What is virtual memory?", o: ["Extra RAM hardware only", "A technique using secondary storage to extend memory", "A monitor type", "A scheduling queue"], a: 1, e: "Virtual memory lets the OS support address spaces beyond physical RAM.", topic: "Memory" },
  { s: "Data Structures", d: "Advanced", q: "Which structure is typically used by breadth-first search?", o: ["Stack", "Queue", "Heap only", "Hash function"], a: 1, e: "BFS uses a queue to explore vertices level by level.", topic: "Graphs" }
];

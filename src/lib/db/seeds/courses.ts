import {
  getCourseBySlug,
  createCourse,
  createUnit,
  createLesson,
  createLessonStep,
} from "../learning";

export async function seedCourses() {
  await seedMathCourse();
  await seedPythonCourse();
  await seedScienceCourse();
}

async function seedMathCourse() {
  const existing = await getCourseBySlug("math-fundamentals");
  if (existing) return;

  const course = await createCourse({
    title: "Math Fundamentals",
    slug: "math-fundamentals",
    subject: "math",
    description:
      "Build a solid foundation in mathematics covering arithmetic, algebra, and basic geometry.",
    difficulty: "beginner",
    xpReward: 200,
    estimatedMinutes: 60,
  });

  // Unit 1: Arithmetic
  const unit1 = await createUnit({
    courseId: course.id,
    title: "Arithmetic Essentials",
    description: "Master the basics of numbers and operations.",
    orderIndex: 0,
  });

  const lesson1 = await createLesson({
    unitId: unit1.id,
    title: "Addition & Subtraction",
    description: "Learn how to add and subtract whole numbers.",
    type: "lesson",
    orderIndex: 0,
    estimatedMinutes: 10,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson1.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "Introduction to Addition",
      body: `## What is Addition?

Addition is the process of combining two or more numbers to get a total, called the **sum**.

### Key Concepts
- The **+** symbol means "add"
- The numbers being added are called **addends**
- The result is called the **sum**

### Example
$$3 + 4 = 7$$

Here, 3 and 4 are addends, and 7 is the sum.

### Tips
- You can add numbers in any order: $3 + 4 = 4 + 3$ (commutative property)
- Adding zero to any number leaves it unchanged: $5 + 0 = 5$`,
    },
  });

  await createLessonStep({
    lessonId: lesson1.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "mcq",
      prompt: "What is 8 + 7?",
      options: ["13", "14", "15", "16"],
      correctAnswer: "15",
      explanation:
        "8 + 7 = 15. You can count up from 8: 9, 10, 11, 12, 13, 14, 15.",
      hints: [
        "Try counting up from the larger number.",
        "Start at 8 and count 7 more steps.",
        "8, 9, 10, 11, 12, 13, 14, 15 — that's 7 steps.",
      ],
      subject: "math",
      topic: "addition",
      difficulty: "beginner",
    },
  });

  await createLessonStep({
    lessonId: lesson1.id,
    type: "exercise",
    orderIndex: 2,
    exerciseData: {
      type: "fill_blank",
      prompt: "15 - 6 = ___",
      correctAnswer: "9",
      explanation:
        "15 - 6 = 9. Subtraction is the inverse of addition: 6 + 9 = 15.",
      hints: [
        "Think about what number plus 6 equals 15.",
        "Count backwards from 15 by 6.",
        "15, 14, 13, 12, 11, 10, 9 — stop after 6 steps.",
      ],
      subject: "math",
      topic: "subtraction",
      difficulty: "beginner",
    },
  });

  const lesson2 = await createLesson({
    unitId: unit1.id,
    title: "Multiplication & Division",
    description: "Understand multiplication tables and basic division.",
    type: "lesson",
    orderIndex: 1,
    estimatedMinutes: 12,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson2.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "Multiplication Basics",
      body: `## What is Multiplication?

Multiplication is repeated addition. Instead of adding the same number many times, we use the **×** symbol.

### Key Concepts
- $a \\times b$ means "add $a$ to itself $b$ times"
- The result is called the **product**
- Numbers being multiplied are called **factors**

### Example
$$4 \\times 3 = 12$$

This means $4 + 4 + 4 = 12$.

### Multiplication Table (×1 to ×5)
| × | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 1 | 1 | 2 | 3 | 4 | 5 |
| 2 | 2 | 4 | 6 | 8 | 10|
| 3 | 3 | 6 | 9 | 12| 15|`,
    },
  });

  await createLessonStep({
    lessonId: lesson2.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "mcq",
      prompt: "What is 6 × 7?",
      options: ["36", "42", "48", "54"],
      correctAnswer: "42",
      explanation: "6 × 7 = 42. Remember: 6 × 7 is the same as 7 × 6.",
      hints: [
        "Think of it as 6 groups of 7.",
        "6 × 7 = 6 × 5 + 6 × 2 = 30 + 12",
        "30 + 12 = 42",
      ],
      subject: "math",
      topic: "multiplication",
      difficulty: "beginner",
    },
  });

  // Unit 2: Algebra Intro
  const unit2 = await createUnit({
    courseId: course.id,
    title: "Introduction to Algebra",
    description: "Discover the power of variables and equations.",
    orderIndex: 1,
  });

  const lesson3 = await createLesson({
    unitId: unit2.id,
    title: "Variables and Expressions",
    description: "Learn what variables are and how to write expressions.",
    type: "lesson",
    orderIndex: 0,
    estimatedMinutes: 15,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson3.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "What is a Variable?",
      body: `## Variables in Mathematics

A **variable** is a symbol (usually a letter) that represents an unknown or changing value.

### Why Use Variables?
- To write general rules that work for any number
- To solve problems where we don't know a value yet
- To describe relationships between quantities

### Examples
- $x + 5 = 10$ — here $x$ is a variable we want to find
- $y = 2x + 3$ — a relationship between $x$ and $y$

### Evaluating Expressions
If $x = 3$, then $2x + 1 = 2(3) + 1 = 7$`,
    },
  });

  await createLessonStep({
    lessonId: lesson3.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "fill_blank",
      prompt: "If x = 4, what is 3x + 2?",
      correctAnswer: "14",
      explanation:
        "Substitute x = 4: 3(4) + 2 = 12 + 2 = 14.",
      hints: [
        "Replace x with 4 in the expression.",
        "3 × 4 = 12, then add 2.",
        "12 + 2 = 14",
      ],
      subject: "math",
      topic: "algebra",
      difficulty: "beginner",
    },
  });

  const lesson4 = await createLesson({
    unitId: unit2.id,
    title: "Solving Simple Equations",
    description: "Solve one-step equations by balancing both sides.",
    type: "lesson",
    orderIndex: 1,
    estimatedMinutes: 15,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson4.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "Balancing Equations",
      body: `## Solving Equations

An **equation** says two things are equal. To solve it, find the value of the variable.

### The Balance Rule
Whatever you do to one side, do the same to the other.

### Example: Solve $x + 3 = 10$
1. Subtract 3 from both sides
2. $x + 3 - 3 = 10 - 3$
3. $x = 7$

### Check: $7 + 3 = 10$ ✓`,
    },
  });

  await createLessonStep({
    lessonId: lesson4.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "mcq",
      prompt: "Solve for x: x - 5 = 12",
      options: ["7", "17", "60", "-7"],
      correctAnswer: "17",
      explanation:
        "Add 5 to both sides: x - 5 + 5 = 12 + 5, so x = 17.",
      hints: [
        "Think: what operation is being done to x?",
        "Do the opposite operation to both sides.",
        "Add 5 to both sides: x = 12 + 5",
      ],
      subject: "math",
      topic: "equations",
      difficulty: "beginner",
    },
  });
}

async function seedPythonCourse() {
  const existing = await getCourseBySlug("python-programming-basics");
  if (existing) return;

  const course = await createCourse({
    title: "Python Programming Basics",
    slug: "python-programming-basics",
    subject: "programming",
    description:
      "Start your programming journey with Python. Learn variables, control flow, and functions.",
    difficulty: "beginner",
    xpReward: 250,
    estimatedMinutes: 90,
  });

  // Unit 1: Getting Started
  const unit1 = await createUnit({
    courseId: course.id,
    title: "Python Fundamentals",
    description: "Learn the core building blocks of Python.",
    orderIndex: 0,
  });

  const lesson1 = await createLesson({
    unitId: unit1.id,
    title: "Variables and Data Types",
    description: "Understand how Python stores and handles data.",
    type: "lesson",
    orderIndex: 0,
    estimatedMinutes: 15,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson1.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "Python Variables",
      body: `## Variables in Python

A **variable** is a named container that stores a value.

\`\`\`python
name = "Alice"
age = 25
height = 5.7
is_student = True
\`\`\`

### Data Types
| Type | Example | Description |
|------|---------|-------------|
| \`int\` | \`42\` | Whole numbers |
| \`float\` | \`3.14\` | Decimal numbers |
| \`str\` | \`"hello"\` | Text (strings) |
| \`bool\` | \`True\` | True or False |

### Checking Types
\`\`\`python
x = 10
print(type(x))  # <class 'int'>
\`\`\``,
    },
  });

  await createLessonStep({
    lessonId: lesson1.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "mcq",
      prompt: "What data type is the value 3.14 in Python?",
      options: ["int", "str", "float", "bool"],
      correctAnswer: "float",
      explanation:
        "3.14 is a floating-point number (float) because it has a decimal point.",
      hints: [
        "Look at whether it has a decimal point.",
        "Whole numbers are int, decimal numbers are float.",
        "3.14 has a decimal, so it's a float.",
      ],
      subject: "programming",
      topic: "python data types",
      difficulty: "beginner",
    },
  });

  await createLessonStep({
    lessonId: lesson1.id,
    type: "exercise",
    orderIndex: 2,
    exerciseData: {
      type: "fill_blank",
      prompt:
        'What does this code print?\n\n```python\nx = 5\ny = 3\nprint(x + y)\n```',
      correctAnswer: "8",
      explanation: "x + y = 5 + 3 = 8, so print outputs 8.",
      hints: [
        "Add the two variables together.",
        "5 + 3 = ?",
        "5 + 3 = 8",
      ],
      subject: "programming",
      topic: "python variables",
      difficulty: "beginner",
    },
  });

  const lesson2 = await createLesson({
    unitId: unit1.id,
    title: "Control Flow: If/Else",
    description: "Make decisions in your code with conditional statements.",
    type: "lesson",
    orderIndex: 1,
    estimatedMinutes: 15,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson2.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "Conditional Statements",
      body: `## Making Decisions in Python

Use \`if\`, \`elif\`, and \`else\` to run different code based on conditions.

\`\`\`python
temperature = 30

if temperature > 25:
    print("It's hot outside!")
elif temperature > 15:
    print("Nice weather.")
else:
    print("It's cold.")
\`\`\`

### Comparison Operators
| Operator | Meaning |
|----------|---------|
| \`==\` | Equal to |
| \`!=\` | Not equal to |
| \`>\` | Greater than |
| \`<\` | Less than |
| \`>=\` | Greater or equal |
| \`<=\` | Less or equal |`,
    },
  });

  await createLessonStep({
    lessonId: lesson2.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "mcq",
      prompt:
        'What does this code print?\n\n```python\nx = 10\nif x > 5:\n    print("big")\nelse:\n    print("small")\n```',
      options: ["big", "small", "10", "Nothing"],
      correctAnswer: "big",
      explanation:
        "x is 10, which is greater than 5, so the if branch runs and prints 'big'.",
      hints: [
        "Check whether the condition x > 5 is true.",
        "Is 10 > 5?",
        "Yes, 10 > 5 is True, so 'big' is printed.",
      ],
      subject: "programming",
      topic: "python conditionals",
      difficulty: "beginner",
    },
  });

  // Unit 2: Functions
  const unit2 = await createUnit({
    courseId: course.id,
    title: "Functions and Loops",
    description: "Reuse code with functions and repeat actions with loops.",
    orderIndex: 1,
  });

  const lesson3 = await createLesson({
    unitId: unit2.id,
    title: "Defining Functions",
    description: "Learn to write reusable blocks of code.",
    type: "lesson",
    orderIndex: 0,
    estimatedMinutes: 20,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson3.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "Python Functions",
      body: `## What is a Function?

A **function** is a reusable block of code that performs a specific task.

\`\`\`python
def greet(name):
    message = f"Hello, {name}!"
    return message

result = greet("Alice")
print(result)  # Hello, Alice!
\`\`\`

### Key Parts
- \`def\` keyword starts the definition
- **name** identifies the function
- **parameters** are inputs (in parentheses)
- \`return\` sends a value back
- **call** the function by using its name with arguments`,
    },
  });

  await createLessonStep({
    lessonId: lesson3.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "mcq",
      prompt:
        'What does this function return when called with add(3, 4)?\n\n```python\ndef add(a, b):\n    return a + b\n```',
      options: ["34", "7", "a + b", "None"],
      correctAnswer: "7",
      explanation: "The function adds its parameters: 3 + 4 = 7.",
      hints: [
        "The function adds two numbers together.",
        "Replace a with 3 and b with 4.",
        "3 + 4 = 7",
      ],
      subject: "programming",
      topic: "python functions",
      difficulty: "beginner",
    },
  });

  const lesson4 = await createLesson({
    unitId: unit2.id,
    title: "Loops: for and while",
    description: "Repeat actions efficiently using loops.",
    type: "lesson",
    orderIndex: 1,
    estimatedMinutes: 20,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson4.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "Python Loops",
      body: `## Repeating Code with Loops

### For Loop
Iterates over a sequence:

\`\`\`python
for i in range(5):
    print(i)
# Prints: 0, 1, 2, 3, 4
\`\`\`

### While Loop
Repeats while a condition is true:

\`\`\`python
count = 0
while count < 3:
    print(count)
    count += 1
# Prints: 0, 1, 2
\`\`\`

### When to Use Each
- **for**: when you know how many times to repeat
- **while**: when you repeat until a condition changes`,
    },
  });

  await createLessonStep({
    lessonId: lesson4.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "fill_blank",
      prompt:
        "How many times will the loop body execute?\n\n```python\nfor i in range(3):\n    print(i)\n```",
      correctAnswer: "3",
      explanation:
        "range(3) produces [0, 1, 2], so the loop runs 3 times (i = 0, 1, 2).",
      hints: [
        "range(n) generates n numbers.",
        "range(3) generates 0, 1, 2.",
        "That's 3 values, so 3 iterations.",
      ],
      subject: "programming",
      topic: "python loops",
      difficulty: "beginner",
    },
  });
}

async function seedScienceCourse() {
  const existing = await getCourseBySlug("science-basics");
  if (existing) return;

  const course = await createCourse({
    title: "Science Basics",
    slug: "science-basics",
    subject: "science",
    description:
      "Explore the fundamentals of physics and chemistry through clear explanations and practice.",
    difficulty: "beginner",
    xpReward: 200,
    estimatedMinutes: 60,
  });

  // Unit 1: Physics
  const unit1 = await createUnit({
    courseId: course.id,
    title: "Introduction to Physics",
    description: "Understand motion, force, and energy.",
    orderIndex: 0,
  });

  const lesson1 = await createLesson({
    unitId: unit1.id,
    title: "Forces and Motion",
    description: "Discover Newton's laws and how forces affect objects.",
    type: "lesson",
    orderIndex: 0,
    estimatedMinutes: 15,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson1.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "Newton's Laws of Motion",
      body: `## Newton's Three Laws

### First Law (Inertia)
An object at rest stays at rest; an object in motion stays in motion — unless acted on by a net force.

### Second Law (F = ma)
Force equals mass times acceleration:
$$F = ma$$

Where:
- $F$ = force (Newtons, N)
- $m$ = mass (kg)
- $a$ = acceleration (m/s²)

### Third Law (Action-Reaction)
For every action, there is an equal and opposite reaction.

### Example
A 2 kg box accelerates at 3 m/s². The force applied is:
$$F = 2 \\text{ kg} \\times 3 \\text{ m/s}^2 = 6 \\text{ N}$$`,
    },
  });

  await createLessonStep({
    lessonId: lesson1.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "mcq",
      prompt:
        "A 5 kg object accelerates at 2 m/s². What is the net force acting on it?",
      options: ["2.5 N", "7 N", "10 N", "3 N"],
      correctAnswer: "10 N",
      explanation: "Using F = ma: F = 5 kg × 2 m/s² = 10 N.",
      hints: [
        "Use Newton's second law: F = ma.",
        "Multiply mass by acceleration.",
        "5 × 2 = 10 N",
      ],
      subject: "science",
      topic: "newton's laws",
      difficulty: "beginner",
    },
  });

  await createLessonStep({
    lessonId: lesson1.id,
    type: "exercise",
    orderIndex: 2,
    exerciseData: {
      type: "fill_blank",
      prompt:
        "According to Newton's second law, if F = 20 N and m = 4 kg, what is the acceleration (in m/s²)?",
      correctAnswer: "5",
      explanation: "a = F/m = 20/4 = 5 m/s².",
      hints: [
        "Rearrange F = ma to solve for a.",
        "a = F ÷ m",
        "20 ÷ 4 = 5",
      ],
      subject: "science",
      topic: "newton's laws",
      difficulty: "beginner",
    },
  });

  const lesson2 = await createLesson({
    unitId: unit1.id,
    title: "Energy and Work",
    description: "Learn about kinetic, potential energy, and work done.",
    type: "lesson",
    orderIndex: 1,
    estimatedMinutes: 15,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson2.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "Energy Forms and Work",
      body: `## Types of Energy

### Kinetic Energy (KE)
Energy of motion:
$$KE = \\frac{1}{2}mv^2$$

### Potential Energy (PE)
Stored energy due to position:
$$PE = mgh$$

Where $g = 9.8 \\text{ m/s}^2$ (gravitational acceleration near Earth's surface).

### Work
Work is done when a force moves an object:
$$W = Fd\\cos\\theta$$

For force parallel to motion: $W = Fd$

### Conservation of Energy
Energy cannot be created or destroyed — only converted between forms.`,
    },
  });

  await createLessonStep({
    lessonId: lesson2.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "mcq",
      prompt:
        "A 2 kg ball moving at 3 m/s. What is its kinetic energy?",
      options: ["6 J", "9 J", "3 J", "12 J"],
      correctAnswer: "9 J",
      explanation: "KE = ½mv² = ½ × 2 × 3² = ½ × 2 × 9 = 9 J.",
      hints: [
        "Use the formula KE = ½mv².",
        "Square the velocity first: 3² = 9.",
        "½ × 2 × 9 = 9 J",
      ],
      subject: "science",
      topic: "kinetic energy",
      difficulty: "beginner",
    },
  });

  // Unit 2: Chemistry Basics
  const unit2 = await createUnit({
    courseId: course.id,
    title: "Chemistry Fundamentals",
    description: "Explore atoms, elements, and basic chemical reactions.",
    orderIndex: 1,
  });

  const lesson3 = await createLesson({
    unitId: unit2.id,
    title: "Atoms and Elements",
    description: "Understand the building blocks of matter.",
    type: "lesson",
    orderIndex: 0,
    estimatedMinutes: 15,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson3.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "The Building Blocks of Matter",
      body: `## Atoms and Elements

### What is an Atom?
An **atom** is the smallest unit of an element that retains its chemical properties.

### Parts of an Atom
- **Protons** (positive charge) — in the nucleus
- **Neutrons** (no charge) — in the nucleus
- **Electrons** (negative charge) — orbit the nucleus

### Elements
An **element** is a pure substance made of only one type of atom.

| Element | Symbol | Atomic Number |
|---------|--------|---------------|
| Hydrogen | H | 1 |
| Carbon | C | 6 |
| Oxygen | O | 8 |
| Iron | Fe | 26 |

The **atomic number** equals the number of protons.`,
    },
  });

  await createLessonStep({
    lessonId: lesson3.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "mcq",
      prompt: "What determines the atomic number of an element?",
      options: [
        "Number of neutrons",
        "Number of protons",
        "Number of electrons",
        "Total mass",
      ],
      correctAnswer: "Number of protons",
      explanation:
        "The atomic number is defined as the number of protons in the nucleus of an atom.",
      hints: [
        "The atomic number is unique to each element.",
        "Think about the positively charged particles.",
        "It's the number of protons in the nucleus.",
      ],
      subject: "science",
      topic: "atomic structure",
      difficulty: "beginner",
    },
  });

  const lesson4 = await createLesson({
    unitId: unit2.id,
    title: "Chemical Reactions",
    description: "Learn how substances combine and transform.",
    type: "lesson",
    orderIndex: 1,
    estimatedMinutes: 15,
    xpReward: 50,
  });

  await createLessonStep({
    lessonId: lesson4.id,
    type: "content",
    orderIndex: 0,
    contentData: {
      title: "Chemical Reactions",
      body: `## What is a Chemical Reaction?

A **chemical reaction** transforms reactants into products with different properties.

### Notation
$$\\text{Reactants} \\rightarrow \\text{Products}$$

### Example: Burning Hydrogen
$$2H_2 + O_2 \\rightarrow 2H_2O$$

Two hydrogen molecules react with one oxygen molecule to form two water molecules.

### Law of Conservation of Mass
**Mass is conserved**: the total mass of reactants equals the total mass of products.

### Types of Reactions
- **Synthesis**: A + B → AB
- **Decomposition**: AB → A + B
- **Combustion**: Fuel + O₂ → CO₂ + H₂O`,
    },
  });

  await createLessonStep({
    lessonId: lesson4.id,
    type: "exercise",
    orderIndex: 1,
    exerciseData: {
      type: "mcq",
      prompt:
        "In a chemical reaction, if the reactants have a total mass of 50 g, what is the total mass of the products?",
      options: ["Less than 50 g", "More than 50 g", "Exactly 50 g", "Cannot be determined"],
      correctAnswer: "Exactly 50 g",
      explanation:
        "The Law of Conservation of Mass states that mass is neither created nor destroyed in a chemical reaction.",
      hints: [
        "Think about the Law of Conservation of Mass.",
        "Mass cannot be created or destroyed.",
        "The total mass stays the same: 50 g.",
      ],
      subject: "science",
      topic: "chemical reactions",
      difficulty: "beginner",
    },
  });
}

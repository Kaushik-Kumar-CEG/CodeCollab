// This file simulates a backend record of an instructor's keystrokes.
// A real system would record { timestamp, codeSnapshot } as the instructor types.
// For CodeCollab demo, we hardcode absolute code snapshots mapped to seconds.

export const DUMMY_LECTURE = {
  id: "demo",
  title: "Python 101: Understanding Recursion",
  videoUrl: "/video.mp4",
  baseLanguage: "python",
  timeline: [
    { time: 0, code: "" },
    { time: 1, code: "# Understanding Recursion in Python" },
    { time: 2, code: "# Understanding Recursion in Python\n\ndef factorial(n):" },
    { time: 3, code: "# Understanding Recursion in Python\n\ndef factorial(n):\n    # Base case: stop when n is 1\n    if n <= 1:\n        return 1" },
    { time: 5, code: "# Understanding Recursion in Python\n\ndef factorial(n):\n    # Base case: stop when n is 1\n    if n <= 1:\n        return 1\n    # Recursive step\n    return n * factorial(n - 1)" },
    { time: 7, code: "# Understanding Recursion in Python\n\ndef factorial(n):\n    # Base case: stop when n is 1\n    if n <= 1:\n        return 1\n    # Recursive step\n    return n * factorial(n - 1)\n\n# Test it\nresult = factorial(5)" },
    { time: 9, code: "# Understanding Recursion in Python\n\ndef factorial(n):\n    # Base case: stop when n is 1\n    if n <= 1:\n        return 1\n    # Recursive step\n    return n * factorial(n - 1)\n\n# Test it\nresult = factorial(5)\nprint(f\"5! = {result}\")  # Output: 120" },
  ]
};

// Helper: given a timestamp in seconds, return the latest code snapshot at or before that time
export const getCodeAtTime = (seconds) => {
  let code = DUMMY_LECTURE.timeline[0].code;
  for (const event of DUMMY_LECTURE.timeline) {
    if (seconds >= event.time) {
      code = event.code;
    } else {
      break;
    }
  }
  return code;
};

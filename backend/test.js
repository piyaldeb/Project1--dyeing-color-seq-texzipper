const pLimit = require("p-limit");

const limit = pLimit(2); // Limit to 2 concurrent tasks

const tasks = [
    () => new Promise(resolve => setTimeout(() => resolve("Task 1"), 1000)),
    () => new Promise(resolve => setTimeout(() => resolve("Task 2"), 500)),
    () => new Promise(resolve => setTimeout(() => resolve("Task 3"), 1500)),
];

(async () => {
    const results = await Promise.all(tasks.map(task => limit(task)));
    console.log(results); // Should print ["Task 1", "Task 2", "Task 3"]
})();
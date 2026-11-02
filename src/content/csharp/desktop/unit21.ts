import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 21 (Thread safety & parallelism).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Races & lock
    [
      {
        kind: 'write',
        prompt: 'Sell 500 tickets in parallel without losing a single count.',
        starter: '',
        solution:
          'var gate = new Lock();\nint tickets = 0;\nParallel.For(0, 500, _ => { lock (gate) tickets++; });\nConsole.WriteLine($"Tickets sold: {tickets}");',
        checks: [
          { label: 'A lock object (new Lock() or new object())', re: '=\\s*new\\s+(Lock|object)\\s*\\(\\s*\\)|(Lock|object)\\s+\\w+\\s*=\\s*new\\s*\\(\\s*\\)' },
          { label: 'Run 500 iterations with Parallel.For', re: 'Parallel\\.For\\s*\\(\\s*0\\s*,\\s*500\\s*,' },
          { label: 'Increment inside lock (...)', re: 'lock\\s*\\(\\s*\\w+\\s*\\)\\s*\\{?\\s*(\\w+\\s*(\\+\\+|\\+=\\s*1)|\\+\\+\\s*\\w+)' },
          { label: 'Print the total', re: 'Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'Parallel.For(0, 500, _ => { lock (gate) tickets++; }); the _ ignores the loop index.',
        explain: 'Only one thread at a time can be inside the lock, so no two read the same old value. The total is always 500.',
        output: 'Tickets sold: 500',
      },
      {
        kind: 'write',
        prompt: 'Make Account thread-safe with a private lock, and add a Withdraw method.',
        starter:
          'var acct = new Account();\nParallel.For(0, 1000, _ => acct.Deposit(5));\nConsole.WriteLine(acct.Balance);\n\nclass Account\n{\n    public int Balance { get; private set; }\n    public void Deposit(int amount) => Balance += amount;\n}',
        solution:
          'var acct = new Account();\nParallel.For(0, 1000, _ => acct.Deposit(5));\nParallel.For(0, 200, _ => acct.Withdraw(5));\nConsole.WriteLine(acct.Balance);\n\nclass Account\n{\n    private readonly Lock gate = new();\n    public int Balance { get; private set; }\n    public void Deposit(int amount)\n    {\n        lock (gate) Balance += amount;\n    }\n    public void Withdraw(int amount)\n    {\n        lock (gate) Balance -= amount;\n    }\n}',
        checks: [
          { label: 'A private readonly lock field', re: 'private\\s+readonly\\s+(Lock|object)\\s+\\w+\\s*=\\s*new' },
          { label: 'Deposit adds inside lock', re: 'Deposit\\s*\\([^)]*\\)\\s*\\{[^}]*lock\\s*\\(\\s*\\w+\\s*\\)\\s*\\{?\\s*Balance\\s*\\+=' },
          { label: 'Withdraw subtracts inside lock', re: 'Withdraw\\s*\\([^)]*\\)\\s*\\{[^}]*lock\\s*\\(\\s*\\w+\\s*\\)\\s*\\{?\\s*Balance\\s*-=' },
          { label: 'Withdraw in parallel too', re: 'Parallel\\.For\\s*\\([^;]*\\.Withdraw\\s*\\(' },
          { label: 'Don’t lock on this', not: 'lock (this)' },
        ],
        hint: 'A private field like private readonly Lock gate = new(); is only reachable from inside the class.',
        explain: 'Both methods share one lock, so a deposit and a withdrawal can never interleave: 5000 in, 1000 out, 4000 left.',
        output: '4000',
      },
    ],
    // L2 Interlocked
    [
      {
        kind: 'write',
        prompt: 'Count 250 page views and their bytes in parallel with Interlocked.',
        starter: 'int views = 0;\nlong bytes = 0;\n',
        solution:
          'int views = 0;\nlong bytes = 0;\nParallel.For(0, 250, _ =>\n{\n    Interlocked.Increment(ref views);\n    Interlocked.Add(ref bytes, 512);\n});\nConsole.WriteLine($"{views} views, {bytes} bytes");',
        checks: [
          { label: 'Run 250 iterations with Parallel.For', re: 'Parallel\\.For\\s*\\(\\s*0\\s*,\\s*250\\s*,' },
          { label: 'Interlocked.Increment(ref views)', re: 'Interlocked\\.Increment\\s*\\(\\s*ref\\s+views\\s*\\)' },
          { label: 'Interlocked.Add(ref bytes, ...)', re: 'Interlocked\\.Add\\s*\\(\\s*ref\\s+bytes\\s*,\\s*\\d+\\s*\\)' },
          { label: 'Print both totals', re: 'Console\\.WriteLine\\s*\\([^;]*views[^;]*bytes|Console\\.WriteLine\\s*\\([^;]*bytes[^;]*views' },
        ],
        hint: 'Interlocked methods take the variable with ref so they can update it in place.',
        explain: 'Each Interlocked call is one unsplittable step, so no update is lost and you don’t need a lock: 250 × 512 = 128000.',
        output: '250 views, 128000 bytes',
      },
      {
        kind: 'write',
        prompt: 'Fix the prize race so exactly visitor 100 wins.',
        starter:
          'int visitors = 0;\nParallel.For(0, 300, _ =>\n{\n    visitors++;\n    if (visitors == 100) Console.WriteLine("Visitor 100 wins a prize");\n});\nConsole.WriteLine($"Visitors: {visitors}");',
        solution:
          'int visitors = 0;\nParallel.For(0, 300, _ =>\n{\n    int me = Interlocked.Increment(ref visitors);\n    if (me == 100) Console.WriteLine("Visitor 100 wins a prize");\n});\nConsole.WriteLine($"Visitors: {visitors}");',
        checks: [
          { label: 'No visitors++', not: 'visitors++' },
          { label: 'Keep the number Interlocked.Increment returns', re: '(int|var)\\s+\\w+\\s*=\\s*Interlocked\\.Increment\\s*\\(\\s*ref\\s+visitors\\s*\\)' },
          { label: 'Test that number, not visitors, for 100', re: 'if\\s*\\(\\s*(?!visitors\\b)\\w+\\s*==\\s*100\\s*\\)' },
        ],
        hint: 'Increment returns the new value. Reading visitors again could see another thread’s update.',
        explain: 'Each thread gets its own new count from Increment, so exactly one thread sees 100, even with others racing.',
        output: 'Visitor 100 wins a prize\nVisitors: 300',
      },
    ],
    // L3 Concurrent collections
    [
      {
        kind: 'write',
        prompt: 'Tally pet votes in parallel with a ConcurrentDictionary, then print them in order.',
        starter: 'string[] votes = ["cat", "dog", "cat", "fish", "cat", "dog"];\n',
        solution:
          'using System.Collections.Concurrent;\n\nstring[] votes = ["cat", "dog", "cat", "fish", "cat", "dog"];\nvar tally = new ConcurrentDictionary<string, int>();\nParallel.ForEach(votes, v => tally.AddOrUpdate(v, 1, (_, n) => n + 1));\nforeach (var pair in tally.OrderBy(p => p.Key))\n    Console.WriteLine($"{pair.Key}: {pair.Value}");',
        checks: [
          { label: 'using System.Collections.Concurrent;', re: 'using\\s+System\\.Collections\\.Concurrent\\s*;' },
          { label: 'A ConcurrentDictionary<string, int>', re: 'ConcurrentDictionary\\s*<\\s*string\\s*,\\s*int\\s*>' },
          { label: 'Loop with Parallel.ForEach', re: 'Parallel\\.ForEach\\s*\\(\\s*votes\\s*,' },
          { label: 'Count with AddOrUpdate(key, 1, ...)', re: '\\.AddOrUpdate\\s*\\(\\s*\\w+\\s*,\\s*1\\s*,' },
          { label: 'Print in key order with OrderBy', re: '\\.OrderBy\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Key\\s*\\)' },
        ],
        hint: 'AddOrUpdate takes the key, the first value, and a lambda (key, old) => old + 1.',
        explain: 'AddOrUpdate is safe across threads. A dictionary has no fixed order, so sorting by key makes the output repeatable.',
        output: 'cat: 3\ndog: 2\nfish: 1',
      },
      {
        kind: 'write',
        prompt: 'Swap the queue and list for concurrent versions so three workers can share them.',
        starter:
          'var jobs = new Queue<int>();\nfor (int i = 1; i <= 6; i++) jobs.Enqueue(i);\nvar results = new List<int>();\nParallel.For(0, 3, _ =>\n{\n    while (jobs.Count > 0)\n        results.Add(jobs.Dequeue() * 10);\n});\nConsole.WriteLine(string.Join(" ", results.Order()));',
        solution:
          'using System.Collections.Concurrent;\n\nvar jobs = new ConcurrentQueue<int>();\nfor (int i = 1; i <= 6; i++) jobs.Enqueue(i);\nvar results = new ConcurrentBag<int>();\nParallel.For(0, 3, _ =>\n{\n    while (jobs.TryDequeue(out int job))\n        results.Add(job * 10);\n});\nConsole.WriteLine(string.Join(" ", results.Order()));',
        checks: [
          { label: 'using System.Collections.Concurrent;', re: 'using\\s+System\\.Collections\\.Concurrent\\s*;' },
          { label: 'jobs is a ConcurrentQueue<int>', re: 'jobs\\s*=\\s*new\\s+ConcurrentQueue\\s*<\\s*int\\s*>|ConcurrentQueue\\s*<\\s*int\\s*>\\s+jobs' },
          { label: 'results is a ConcurrentBag<int>', re: 'results\\s*=\\s*new\\s+ConcurrentBag\\s*<\\s*int\\s*>|ConcurrentBag\\s*<\\s*int\\s*>\\s+results' },
          { label: 'Take jobs with TryDequeue(out ...)', re: 'while\\s*\\(\\s*jobs\\.TryDequeue\\s*\\(\\s*out\\s+' },
          { label: 'No Count-then-Dequeue', not: 'jobs.Dequeue()' },
        ],
        hint: 'Checking Count then calling Dequeue is two steps another thread can split. TryDequeue does both at once.',
        explain: 'TryDequeue hands each job to exactly one worker and returns false when the queue is empty. Sorting gives a fixed output.',
        output: '10 20 30 40 50 60',
      },
    ],
    // L4 Parallel loops & tasks
    [
      {
        kind: 'write',
        prompt: 'Fill an array with cubes in parallel, each result in its own slot.',
        starter: '',
        solution:
          'var cubes = new long[6];\nParallel.For(0, cubes.Length, i => cubes[i] = (long)i * i * i);\nConsole.WriteLine(string.Join(", ", cubes));',
        checks: [
          { label: 'Make the result array first', re: 'new\\s+(long|int)\\s*\\[\\s*\\d+\\s*\\]' },
          { label: 'Parallel.For over its indexes', re: 'Parallel\\.For\\s*\\(\\s*0\\s*,\\s*[\\w.]+\\s*,\\s*(\\w+)\\s*=>' },
          { label: 'Each pass writes its own slot', re: 'Parallel\\.For\\s*\\(\\s*0\\s*,\\s*[\\w.]+\\s*,\\s*(\\w+)\\s*=>\\s*\\{?\\s*\\w+\\s*\\[\\s*\\1\\s*\\]\\s*=' },
          { label: 'Print the array', re: 'string\\.Join\\s*\\(' },
        ],
        hint: 'Inside the lambda, i is the index: write cubes[i] = ... and nothing else.',
        explain: 'Iterations run in any order, but each writes only to slot i, so there’s nothing to race over and the array ends up in order.',
        output: '0, 1, 8, 27, 64, 125',
      },
      {
        kind: 'write',
        prompt: 'Run the three prime counts at once with Task.Run and Task.WhenAll.',
        starter:
          'int a = CountPrimes(1000);\nint b = CountPrimes(5000);\nint c = CountPrimes(10000);\nConsole.WriteLine($"{a} {b} {c}");\n\nint CountPrimes(int max)\n{\n    int count = 0;\n    for (int n = 2; n <= max; n++)\n    {\n        bool prime = true;\n        for (int d = 2; d * d <= n; d++)\n            if (n % d == 0) { prime = false; break; }\n        if (prime) count++;\n    }\n    return count;\n}',
        solution:
          'var a = Task.Run(() => CountPrimes(1000));\nvar b = Task.Run(() => CountPrimes(5000));\nvar c = Task.Run(() => CountPrimes(10000));\nint[] counts = await Task.WhenAll(a, b, c);\nConsole.WriteLine(string.Join(" ", counts));\n\nint CountPrimes(int max)\n{\n    int count = 0;\n    for (int n = 2; n <= max; n++)\n    {\n        bool prime = true;\n        for (int d = 2; d * d <= n; d++)\n            if (n % d == 0) { prime = false; break; }\n        if (prime) count++;\n    }\n    return count;\n}',
        checks: [
          { label: 'Start each count with Task.Run', re: '(Task\\.Run\\s*\\(\\s*\\(\\s*\\)\\s*=>\\s*CountPrimes\\s*\\([\\s\\S]*){3}' },
          { label: 'Await them all with Task.WhenAll', re: 'await\\s+Task\\.WhenAll\\s*\\(' },
          { label: 'Print the three counts', re: 'Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'Task.Run(() => CountPrimes(1000)) runs on the thread pool and gives a Task<int>.',
        explain: 'Task.Run moves CPU work onto other threads, so all three counts run side by side. WhenAll keeps the order you passed.',
        output: '168 669 1229',
      },
    ],
    // L5 Throttling & safe sharing
    [
      {
        kind: 'write',
        prompt: 'Run five downloads, but at most two at a time, with a SemaphoreSlim.',
        starter: '',
        solution:
          'var gate = new SemaphoreSlim(2);\nint done = 0;\nvar tasks = Enumerable.Range(1, 5).Select(async i =>\n{\n    await gate.WaitAsync();\n    try\n    {\n        await Task.Delay(50);\n        Interlocked.Increment(ref done);\n    }\n    finally\n    {\n        gate.Release();\n    }\n});\nawait Task.WhenAll(tasks);\nConsole.WriteLine($"{done} downloads finished");',
        checks: [
          { label: 'new SemaphoreSlim(2)', re: 'new\\s+SemaphoreSlim\\s*\\(\\s*2\\s*\\)' },
          { label: 'await WaitAsync() before the work', re: 'await\\s+\\w+\\.WaitAsync\\s*\\(\\s*\\)' },
          { label: 'Release() in a finally', re: 'finally\\s*\\{[^}]*\\w+\\.Release\\s*\\(\\s*\\)' },
          { label: 'Await all five with Task.WhenAll', re: 'await\\s+Task\\.WhenAll\\s*\\(' },
          { label: 'Count finished downloads safely', re: 'Interlocked\\.(Increment|Add)\\s*\\(|lock\\s*\\(' },
        ],
        hint: 'Each download: await gate.WaitAsync(); then try { work } finally { gate.Release(); }.',
        explain: 'The semaphore lets two tasks in; the rest wait their turn. finally makes sure a slot is always handed back.',
        output: '5 downloads finished',
      },
      {
        kind: 'write',
        prompt: 'You can’t await inside lock. Guard Save with a SemaphoreSlim instead.',
        starter:
          'var gate = new object();\nvar log = new List<string>();\nawait Task.WhenAll(Save("a"), Save("b"), Save("c"));\nConsole.WriteLine(string.Join(",", log.Order()));\n\nasync Task Save(string name)\n{\n    lock (gate)\n    {\n        await Task.Delay(10);\n        log.Add(name);\n    }\n}',
        solution:
          'var gate = new SemaphoreSlim(1);\nvar log = new List<string>();\nawait Task.WhenAll(SaveAsync("a"), SaveAsync("b"), SaveAsync("c"));\nConsole.WriteLine(string.Join(",", log.Order()));\n\nasync Task SaveAsync(string name)\n{\n    await gate.WaitAsync();\n    try\n    {\n        await Task.Delay(10);\n        log.Add(name);\n    }\n    finally\n    {\n        gate.Release();\n    }\n}',
        checks: [
          { label: 'gate is a new SemaphoreSlim(1)', re: 'new\\s+SemaphoreSlim\\s*\\(\\s*1\\s*\\)' },
          { label: 'No lock statement left', not: 'lock (' },
          { label: 'await gate.WaitAsync() first', re: 'await\\s+gate\\.WaitAsync\\s*\\(\\s*\\)' },
          { label: 'Do the work in try, Release() in finally', re: 'try\\s*\\{[\\s\\S]*\\.Add\\s*\\([\\s\\S]*finally\\s*\\{[^}]*gate\\.Release\\s*\\(\\s*\\)' },
        ],
        hint: 'A SemaphoreSlim with 1 slot works like an async lock: WaitAsync to enter, Release to leave.',
        explain: 'lock can’t span an await, so C# refuses to compile it. SemaphoreSlim(1) lets one save at a time and can be awaited.',
        output: 'a,b,c',
      },
    ],
  ],
};

export default unit;

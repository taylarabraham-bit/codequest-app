import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 14 (Async/await).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Task & await
    [
      {
        kind: 'write',
        prompt: 'Run a washing machine: wash, wait, rinse, wait, then say it’s done.',
        starter: '',
        solution:
          'Console.WriteLine("Washing...");\nawait Task.Delay(300);\nConsole.WriteLine("Rinsing...");\nawait Task.Delay(200);\nConsole.WriteLine("Laundry done");',
        checks: [
          { label: 'Wait twice with await Task.Delay(...)', re: '(await\\s+Task\\.Delay\\s*\\(\\s*\\d+\\s*\\)[\\s\\S]*){2}' },
          { label: 'Print a step before the first wait', re: '^\\s*Console\\.WriteLine\\s*\\([^;]*;\\s*await' },
          { label: 'Print that it’s done after the last wait', re: 'await\\s+Task\\.Delay\\s*\\(\\s*\\d+\\s*\\)\\s*;\\s*Console\\.WriteLine\\s*\\([^;]*\\)\\s*;\\s*$' },
        ],
        hint: 'Top-level code can await directly: await Task.Delay(300); pauses for 300 ms.',
        explain: 'Each await pauses the code without blocking the thread, and the next line runs once the delay is over.',
        output: 'Washing...\nRinsing...\nLaundry done',
      },
      {
        kind: 'write',
        prompt: 'Fix the countdown so every pause really waits without blocking.',
        starter:
          'for (int i = 3; i >= 1; i--)\n{\n    Console.WriteLine(i);\n    Thread.Sleep(1000);\n}\nTask.Delay(500);\nConsole.WriteLine("Liftoff!");',
        solution:
          'for (int i = 3; i >= 1; i--)\n{\n    Console.WriteLine(i);\n    await Task.Delay(1000);\n}\nawait Task.Delay(500);\nConsole.WriteLine("Liftoff!");',
        checks: [
          { label: 'Await a Task.Delay inside the loop', re: 'for\\s*\\([^)]*\\)\\s*\\{[^}]*await\\s+Task\\.Delay\\s*\\(' },
          { label: 'No Thread.Sleep', not: 'Thread.Sleep' },
          { label: 'Every Task.Delay is awaited', re: '^(?![\\s\\S]*(?:^|\\n)\\s*Task\\.Delay)[\\s\\S]*await\\s+Task\\.Delay' },
          { label: 'Still print Liftoff! at the end', re: 'Console\\.WriteLine\\s*\\(\\s*"Liftoff!"\\s*\\)\\s*;\\s*$' },
        ],
        hint: 'A Task.Delay that isn’t awaited starts a timer and moves straight on. Thread.Sleep blocks the thread.',
        explain: 'await Task.Delay pauses this code and frees the thread. Without await, the 500 ms pause was skipped entirely.',
        output: '3\n2\n1\nLiftoff!',
      },
    ],
    // L2 Writing async methods
    [
      {
        kind: 'write',
        prompt: 'Write GetHighScoreAsync, which waits briefly and returns a score; await and print it.',
        starter: '',
        solution:
          'int best = await GetHighScoreAsync();\nConsole.WriteLine($"High score: {best}");\n\nasync Task<int> GetHighScoreAsync()\n{\n    await Task.Delay(200);\n    return 9001;\n}',
        checks: [
          { label: 'Declare async Task<int> GetHighScoreAsync()', re: 'async\\s+Task\\s*<\\s*int\\s*>\\s+GetHighScoreAsync\\s*\\(\\s*\\)' },
          { label: 'Await a delay inside it', re: 'GetHighScoreAsync\\s*\\(\\s*\\)\\s*\\{[^}]*await\\s+Task\\.Delay' },
          { label: 'Return a plain int', re: 'return\\s+\\d+\\s*;' },
          { label: 'Await the call and print the result', re: '=\\s*await\\s+GetHighScoreAsync\\s*\\(\\s*\\)' },
        ],
        hint: 'Inside an async Task<int> method you just return 9001; C# wraps it in the Task.',
        explain: 'The method hands back a Task<int> at once; await unwraps the int when the work finishes.',
        output: 'High score: 9001',
      },
      {
        kind: 'write',
        prompt: 'Make both methods properly async, named with Async, and await them.',
        starter:
          'string msg = LoadGreeting("Mia");\nConsole.WriteLine(msg);\nSaveLog(msg);\nConsole.WriteLine("Saved");\n\nstring LoadGreeting(string name)\n{\n    Thread.Sleep(300);\n    return $"Welcome back, {name}";\n}\n\nasync void SaveLog(string text)\n{\n    await Task.Delay(100);\n    Console.WriteLine($"Log: {text}");\n}',
        solution:
          'string msg = await LoadGreetingAsync("Mia");\nConsole.WriteLine(msg);\nawait SaveLogAsync(msg);\nConsole.WriteLine("Saved");\n\nasync Task<string> LoadGreetingAsync(string name)\n{\n    await Task.Delay(300);\n    return $"Welcome back, {name}";\n}\n\nasync Task SaveLogAsync(string text)\n{\n    await Task.Delay(100);\n    Console.WriteLine($"Log: {text}");\n}',
        checks: [
          { label: 'async Task<string> LoadGreetingAsync', re: 'async\\s+Task\\s*<\\s*string\\s*>\\s+LoadGreetingAsync\\s*\\(' },
          { label: 'async Task SaveLogAsync (not async void)', re: 'async\\s+Task\\s+SaveLogAsync\\s*\\(' },
          { label: 'No async void left', not: 'async void' },
          { label: 'No Thread.Sleep', not: 'Thread.Sleep' },
          { label: 'Await both calls', re: 'await\\s+LoadGreetingAsync\\s*\\([\\s\\S]*await\\s+SaveLogAsync\\s*\\(' },
        ],
        hint: 'Return Task<string> for a value and Task for none. Swap Thread.Sleep for await Task.Delay.',
        explain: 'async void can’t be awaited, so Saved printed before the log ever ran. Returning a Task lets the caller wait for it.',
        output: 'Welcome back, Mia\nLog: Welcome back, Mia\nSaved',
      },
    ],
    // L3 Awaiting many tasks
    [
      {
        kind: 'write',
        prompt: 'Start three downloads at once, then await them all and print the sizes.',
        starter: 'async Task<int> SizeAsync(int ms)\n{\n    await Task.Delay(ms);\n    return ms / 10;\n}',
        solution:
          'Task<int> photo = SizeAsync(300);\nTask<int> song = SizeAsync(100);\nTask<int> video = SizeAsync(200);\nint[] sizes = await Task.WhenAll(photo, song, video);\nConsole.WriteLine(string.Join(", ", sizes));\nConsole.WriteLine($"Total: {sizes.Sum()} MB");\n\nasync Task<int> SizeAsync(int ms)\n{\n    await Task.Delay(ms);\n    return ms / 10;\n}',
        checks: [
          { label: 'Start three SizeAsync calls without await', re: '((Task\\s*<\\s*int\\s*>|var)\\s+\\w+\\s*=\\s*SizeAsync\\s*\\([\\s\\S]*){3}await\\s+Task\\.WhenAll' },
          { label: 'Await them with Task.WhenAll', re: '(int\\s*\\[\\s*\\]|var)\\s+\\w+\\s*=\\s*await\\s+Task\\.WhenAll\\s*\\(' },
          { label: 'Print every size', re: 'string\\.Join\\s*\\(|foreach\\s*\\(' },
          { label: 'Print the total with Sum()', has: '.Sum()' },
        ],
        hint: 'Store each Task<int> in a variable first, then pass all three to Task.WhenAll.',
        explain: 'All three run side by side, so the wait is about 300 ms, not 600. WhenAll keeps the order you passed: 30, 10, 20.',
        output: '30, 10, 20\nTotal: 60 MB',
      },
      {
        kind: 'write',
        prompt: 'The vote count runs one colour at a time. Count all three side by side.',
        starter:
          'int red = await CountVotesAsync("red");\nint blue = await CountVotesAsync("blue");\nint green = await CountVotesAsync("green");\nConsole.WriteLine($"Votes: {red + blue + green}");\n\nasync Task<int> CountVotesAsync(string colour)\n{\n    Console.WriteLine($"Counting {colour}");\n    await Task.Delay(500);\n    return colour.Length;\n}',
        solution:
          'Task<int> red = CountVotesAsync("red");\nTask<int> blue = CountVotesAsync("blue");\nTask<int> green = CountVotesAsync("green");\nint[] votes = await Task.WhenAll(red, blue, green);\nConsole.WriteLine($"Votes: {votes.Sum()}");\n\nasync Task<int> CountVotesAsync(string colour)\n{\n    Console.WriteLine($"Counting {colour}");\n    await Task.Delay(500);\n    return colour.Length;\n}',
        checks: [
          { label: 'Don’t await each call on its own', not: 'await CountVotesAsync' },
          { label: 'Keep three running tasks', re: '(=\\s*CountVotesAsync\\s*\\([\\s\\S]*){3}' },
          { label: 'Await them together with Task.WhenAll', re: 'await\\s+Task\\.WhenAll\\s*\\(' },
          { label: 'Print the total', re: 'Console\\.WriteLine\\s*\\(\\s*\\$"Votes: \\{[^}]+\\}"' },
        ],
        hint: 'Drop the await from each line and keep the Task<int>; one await Task.WhenAll(...) gives you all the ints.',
        explain: 'Each call runs up to its first await, so all three Counting lines print at once, and the total wait is 500 ms instead of 1500.',
        output: 'Counting red\nCounting blue\nCounting green\nVotes: 12',
      },
    ],
    // L4 Cancellation tokens
    [
      {
        kind: 'write',
        prompt: 'Give up on a slow match search after 200 ms.',
        starter: '',
        solution:
          'using var cts = new CancellationTokenSource();\ncts.CancelAfter(200);\ntry\n{\n    Console.WriteLine("Searching for match...");\n    await Task.Delay(10000, cts.Token);\n    Console.WriteLine("Match found");\n}\ncatch (OperationCanceledException)\n{\n    Console.WriteLine("Search timed out");\n}',
        checks: [
          { label: 'Create a CancellationTokenSource', re: 'new\\s+CancellationTokenSource\\s*\\(' },
          { label: 'Cancel it after 200 ms', re: '\\.CancelAfter\\s*\\(\\s*200\\s*\\)|new\\s+CancellationTokenSource\\s*\\(\\s*200\\s*\\)' },
          { label: 'Pass the Token to a long Task.Delay', re: 'await\\s+Task\\.Delay\\s*\\(\\s*\\d+\\s*,\\s*\\w+\\.Token\\s*\\)' },
          { label: 'Catch OperationCanceledException', re: 'catch\\s*\\(\\s*(Operation|Task)CanceledException\\b' },
        ],
        hint: 'cts.CancelAfter(200), then await Task.Delay(10000, cts.Token) inside a try.',
        explain: 'After 200 ms the token is cancelled, the delay stops early and throws, and the catch reports the timeout.',
        output: 'Searching for match...\nSearch timed out',
      },
      {
        kind: 'write',
        prompt: 'Let the backup be cancelled: pass it a token, start it, then cancel.',
        starter:
          'await BackupAsync();\n\nasync Task BackupAsync()\n{\n    Console.WriteLine("Backup started");\n    await Task.Delay(5000);\n    Console.WriteLine("Backup done");\n}',
        solution:
          'using var cts = new CancellationTokenSource();\nTask backup = BackupAsync(cts.Token);\nConsole.WriteLine("User pressed Stop");\ncts.Cancel();\ntry\n{\n    await backup;\n}\ncatch (OperationCanceledException)\n{\n    Console.WriteLine("Backup cancelled");\n}\n\nasync Task BackupAsync(CancellationToken token)\n{\n    Console.WriteLine("Backup started");\n    await Task.Delay(5000, token);\n    Console.WriteLine("Backup done");\n}',
        checks: [
          { label: 'BackupAsync takes a CancellationToken', re: 'BackupAsync\\s*\\(\\s*CancellationToken\\s+\\w+\\s*\\)' },
          { label: 'Pass the token on to Task.Delay', re: 'Task\\.Delay\\s*\\(\\s*\\d+\\s*,\\s*\\w+\\s*\\)' },
          { label: 'Start the backup with cts.Token, without awaiting yet', re: '(Task|var)\\s+\\w+\\s*=\\s*BackupAsync\\s*\\(\\s*\\w+\\.Token\\s*\\)' },
          { label: 'Call Cancel(), then await the task', re: '\\.Cancel\\s*\\(\\s*\\)[\\s\\S]*await\\s+\\w+\\s*;' },
          { label: 'Catch OperationCanceledException', re: 'catch\\s*\\(\\s*(Operation|Task)CanceledException\\b' },
        ],
        hint: 'Keep the Task in a variable, call cts.Cancel(), then await the task inside try.',
        explain: 'The backup runs to its first await and pauses; Cancel() stops the delay, so awaiting the task throws and Backup done never prints.',
        output: 'Backup started\nUser pressed Stop\nBackup cancelled',
      },
    ],
    // L5 Async streams
    [
      {
        kind: 'write',
        prompt: 'Stream chat messages one by one with an async iterator.',
        starter: '',
        solution:
          'await foreach (string msg in ChatAsync())\n    Console.WriteLine(msg);\n\nasync IAsyncEnumerable<string> ChatAsync()\n{\n    string[] lines = ["Hi!", "Are you there?", "Bye"];\n    foreach (string line in lines)\n    {\n        await Task.Delay(100);\n        yield return line;\n    }\n}',
        checks: [
          { label: 'A method returning async IAsyncEnumerable<string>', re: 'async\\s+IAsyncEnumerable\\s*<\\s*string\\s*>\\s+\\w+\\s*\\(' },
          { label: 'Await a delay between messages', re: 'IAsyncEnumerable[\\s\\S]*await\\s+Task\\.Delay' },
          { label: 'yield return each message', re: 'yield\\s+return\\s+\\w+' },
          { label: 'Read it with await foreach', re: 'await\\s+foreach\\s*\\(' },
        ],
        hint: 'The iterator awaits, then yield returns. The reader uses await foreach (... in ChatAsync()).',
        explain: 'Each message is handed over as soon as it’s ready, and await foreach waits for the next one in turn.',
        output: 'Hi!\nAre you there?\nBye',
      },
      {
        kind: 'write',
        prompt: 'Turn Readings into an async stream so each value arrives when ready.',
        starter:
          'int total = 0;\nforeach (int r in Readings(5))\n{\n    Console.WriteLine($"Reading {r}");\n    total += r;\n}\nConsole.WriteLine($"Total {total}");\n\nList<int> Readings(int count)\n{\n    var list = new List<int>();\n    for (int i = 1; i <= count; i++)\n    {\n        Thread.Sleep(50);\n        list.Add(i * 10);\n    }\n    return list;\n}',
        solution:
          'int total = 0;\nawait foreach (int r in ReadingsAsync(5))\n{\n    Console.WriteLine($"Reading {r}");\n    total += r;\n}\nConsole.WriteLine($"Total {total}");\n\nasync IAsyncEnumerable<int> ReadingsAsync(int count)\n{\n    for (int i = 1; i <= count; i++)\n    {\n        await Task.Delay(50);\n        yield return i * 10;\n    }\n}',
        checks: [
          { label: 'Return async IAsyncEnumerable<int>', re: 'async\\s+IAsyncEnumerable\\s*<\\s*int\\s*>\\s+\\w+\\s*\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'await Task.Delay instead of Thread.Sleep', re: 'IAsyncEnumerable[\\s\\S]*await\\s+Task\\.Delay\\s*\\(' },
          { label: 'yield return each reading (no list)', re: 'yield\\s+return\\s+[^;]+;' },
          { label: 'Loop with await foreach', re: 'await\\s+foreach\\s*\\(\\s*(int|var)\\s+\\w+\\s+in\\s+\\w+\\s*\\(' },
          { label: 'No Thread.Sleep', not: 'Thread.Sleep' },
        ],
        hint: 'Drop the list: inside the loop, await Task.Delay(50); then yield return i * 10;.',
        explain: 'The list version made you wait for all five before seeing any. The stream hands over each reading as it’s made.',
        output: 'Reading 10\nReading 20\nReading 30\nReading 40\nReading 50\nTotal 150',
      },
    ],
  ],
};

export default unit;

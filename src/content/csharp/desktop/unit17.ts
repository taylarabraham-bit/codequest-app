import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 17 (JSON & files).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Write & read text
    [
      {
        kind: 'write',
        prompt: 'Save a to-do note, add a second line, then print the file.',
        starter: '',
        solution:
          'File.WriteAllText("todo.txt", "Walk the dog");\nFile.AppendAllText("todo.txt", "\\nWater plants");\nConsole.WriteLine(File.ReadAllText("todo.txt"));',
        checks: [
          { label: 'Create the file with File.WriteAllText', re: 'File\\.WriteAllText\\s*\\(\\s*"[^"]+"\\s*,' },
          { label: 'Add to it with File.AppendAllText', re: 'File\\.AppendAllText\\s*\\(\\s*"[^"]+"\\s*,' },
          { label: 'Print it with File.ReadAllText', re: 'Console\\.WriteLine\\s*\\(\\s*File\\.ReadAllText\\s*\\(|=\\s*File\\.ReadAllText\\s*\\(' },
          { label: 'Use the same file name each time', re: 'WriteAllText\\s*\\(\\s*("[^"]+")[\\s\\S]*AppendAllText\\s*\\(\\s*\\1[\\s\\S]*ReadAllText\\s*\\(\\s*\\1' },
        ],
        hint: 'AppendAllText adds to the end, so start the new text with \\n to put it on its own line.',
        explain: 'WriteAllText creates (or replaces) the file, AppendAllText adds to it, and ReadAllText gives it all back.',
        output: 'Walk the dog\nWater plants',
      },
      {
        kind: 'write',
        prompt: 'Read the visit counter from its file, add one, save it and print it.',
        starter: 'File.WriteAllText("visits.txt", "41");\n',
        solution:
          'File.WriteAllText("visits.txt", "41");\nint visits = int.Parse(File.ReadAllText("visits.txt"));\nvisits++;\nFile.WriteAllText("visits.txt", visits.ToString());\nstring saved = File.ReadAllText("visits.txt");\nConsole.WriteLine($"Visit number {saved}");',
        checks: [
          { label: 'Read the file and int.Parse it', re: 'int\\.Parse\\s*\\(\\s*File\\.ReadAllText\\s*\\(\\s*"visits\\.txt"\\s*\\)\\s*\\)|int\\.Parse\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Add one', re: '\\w+\\s*(\\+\\+|\\+=\\s*1\\b)|\\+\\+\\s*\\w+|\\+\\s*1\\b' },
          { label: 'Save the new number back to visits.txt', re: '(File\\.WriteAllText\\s*\\(\\s*"visits\\.txt"[\\s\\S]*){2}' },
          { label: 'Print the visit number', re: 'Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'The file holds text, so parse it to an int, add one, then write it back with ToString().',
        explain: 'Files store text only. Parsing turns "41" into 41, and WriteAllText replaces the old contents with "42".',
        output: 'Visit number 42',
      },
    ],
    // L2 Lines, paths & checks
    [
      {
        kind: 'write',
        prompt: 'Save a party guest list in a party folder, then read it back.',
        starter: '',
        solution:
          'Directory.CreateDirectory("party");\nstring path = Path.Combine("party", "guests.txt");\nFile.WriteAllLines(path, ["Ana", "Ben", "Cleo"]);\nstring[] guests = File.ReadAllLines(path);\nConsole.WriteLine($"{guests.Length} guests, first is {guests[0]}");',
        checks: [
          { label: 'Make the folder with Directory.CreateDirectory', re: 'Directory\\.CreateDirectory\\s*\\(\\s*"[^"]+"\\s*\\)' },
          { label: 'Build the path with Path.Combine', re: 'Path\\.Combine\\s*\\(\\s*"[^"]+"\\s*,\\s*"[^"]+\\.txt"\\s*\\)' },
          { label: 'Save the names with File.WriteAllLines', re: 'File\\.WriteAllLines\\s*\\(' },
          { label: 'Read them back with File.ReadAllLines', re: 'File\\.ReadAllLines\\s*\\(' },
          { label: 'Print how many there are', re: '\\.Length\\b|\\.Count\\s*\\(' },
        ],
        hint: 'WriteAllLines takes the path and an array; ReadAllLines gives a string[] back.',
        explain: 'One name per line in, one array item per line out. Path.Combine picks the right slash for Windows or Linux.',
        output: '3 guests, first is Ana',
      },
      {
        kind: 'write',
        prompt: 'Build each path properly and skip players who have no profile file.',
        starter:
          'Directory.CreateDirectory("profiles");\nFile.WriteAllLines(Path.Combine("profiles", "ana.txt"), ["Ana", "Level 4"]);\nstring[] names = ["ana", "zed"];\nforeach (string name in names)\n{\n    string path = "profiles/" + name + ".txt";\n    Console.WriteLine(File.ReadAllLines(path)[1]);\n}',
        solution:
          'Directory.CreateDirectory("profiles");\nFile.WriteAllLines(Path.Combine("profiles", "ana.txt"), ["Ana", "Level 4"]);\nstring[] names = ["ana", "zed"];\nforeach (string name in names)\n{\n    string path = Path.Combine("profiles", $"{name}.txt");\n    if (File.Exists(path))\n        Console.WriteLine(File.ReadAllLines(path)[1]);\n    else\n        Console.WriteLine($"No profile for {name}");\n}',
        checks: [
          { label: 'Build the path with Path.Combine and the name', re: 'Path\\.Combine\\s*\\(\\s*"profiles"\\s*,[^;]*name' },
          { label: 'No hand-written slash', not: '"profiles/"' },
          { label: 'Check File.Exists(path) before reading', re: 'if\\s*\\(\\s*File\\.Exists\\s*\\(\\s*\\w+\\s*\\)\\s*\\)[\\s\\S]*ReadAllLines' },
          { label: 'Print a message when it’s missing', re: '\\belse\\b[\\s\\S]*Console\\.WriteLine|!\\s*File\\.Exists' },
        ],
        hint: 'Path.Combine("profiles", $"{name}.txt"), then if (File.Exists(path)) ... else ....',
        explain: 'Reading a file that isn’t there throws FileNotFoundException. File.Exists lets you handle zed calmly instead.',
        output: 'Level 4\nNo profile for zed',
      },
    ],
    // L3 Streams & using
    [
      {
        kind: 'write',
        prompt: 'Write three log lines with a StreamWriter, then read them back one by one.',
        starter: '',
        solution:
          'using (var w = new StreamWriter("log.txt"))\n{\n    w.WriteLine("Boot");\n    w.WriteLine("Login");\n    w.WriteLine("Logout");\n}\nusing var r = new StreamReader("log.txt");\nstring? line;\nwhile ((line = r.ReadLine()) != null)\n    Console.WriteLine($"> {line}");',
        checks: [
          { label: 'Write inside a using (...) block so it closes first', re: 'using\\s*\\(\\s*(var|StreamWriter)\\s+\\w+\\s*=\\s*new\\s+(StreamWriter\\s*)?\\(' },
          { label: 'Write three lines with WriteLine', re: '(\\w+\\.WriteLine\\s*\\(\\s*"[^"]*"\\s*\\)\\s*;[\\s\\S]*){3}' },
          { label: 'Open it with a StreamReader in using', re: 'using\\s*\\(?\\s*(var|StreamReader)\\s+\\w+\\s*=\\s*new\\s+(StreamReader\\s*)?\\(' },
          { label: 'Loop on ReadLine() until it returns null', re: 'while\\s*\\([^;]*ReadLine\\s*\\(\\s*\\)[^;]*null' },
        ],
        hint: 'while ((line = r.ReadLine()) != null) reads one line per pass and stops at the end.',
        explain: 'Closing the writer flushes the lines to disk before the reader opens the file. ReadLine returns null at the end.',
        output: '> Boot\n> Login\n> Logout',
      },
      {
        kind: 'write',
        prompt: 'Copy only the ERROR lines into errors.log, one line at a time.',
        starter:
          'File.WriteAllLines("server.log", ["INFO start", "ERROR disk", "INFO ok", "ERROR net"]);\n// copy the ERROR lines into errors.log, one line at a time\n',
        solution:
          'File.WriteAllLines("server.log", ["INFO start", "ERROR disk", "INFO ok", "ERROR net"]);\nint errors = 0;\nusing (var reader = new StreamReader("server.log"))\nusing (var writer = new StreamWriter("errors.log"))\n{\n    string? line;\n    while ((line = reader.ReadLine()) != null)\n    {\n        if (!line.StartsWith("ERROR")) continue;\n        writer.WriteLine(line);\n        errors++;\n    }\n}\nConsole.WriteLine($"{errors} errors saved");\nforeach (string e in File.ReadAllLines("errors.log"))\n    Console.WriteLine(e);',
        checks: [
          { label: 'Read server.log with a StreamReader in using', re: 'using\\s*\\(?\\s*(var|StreamReader)\\s+\\w+\\s*=\\s*new\\s+(StreamReader\\s*)?\\(\\s*"server\\.log"' },
          { label: 'Write errors.log with a StreamWriter in using', re: 'using\\s*\\(?\\s*(var|StreamWriter)\\s+\\w+\\s*=\\s*new\\s+(StreamWriter\\s*)?\\(\\s*"errors\\.log"' },
          { label: 'Loop with ReadLine() until null', re: 'while\\s*\\([^;]*ReadLine\\s*\\(\\s*\\)[^;]*null' },
          { label: 'Keep only lines with ERROR', re: '(StartsWith|Contains)\\s*\\(\\s*"ERROR"' },
          { label: 'WriteLine each kept line to the writer', re: '\\w+\\.WriteLine\\s*\\(\\s*\\w+\\s*\\)' },
        ],
        hint: 'Two using lines can share one block. Inside the loop, skip lines that don’t start with ERROR.',
        explain: 'Only one line is in memory at a time, so this works on huge logs. Closing the writer saves errors.log before it’s read.',
        output: '2 errors saved\nERROR disk\nERROR net',
      },
    ],
    // L4 JsonSerializer
    [
      {
        kind: 'write',
        prompt: 'Turn a Recipe record into JSON and print it.',
        starter: '',
        solution:
          'using System.Text.Json;\n\nvar soup = new Recipe("Tomato soup", 25);\nstring json = JsonSerializer.Serialize(soup);\nConsole.WriteLine(json);\n\nrecord Recipe(string Title, int Minutes);',
        checks: [
          { label: 'using System.Text.Json; at the top', re: '^\\s*using\\s+System\\.Text\\.Json\\s*;' },
          { label: 'A record Recipe(string Title, int Minutes)', re: 'record\\s+Recipe\\s*\\(\\s*string\\s+Title\\s*,\\s*int\\s+Minutes\\s*\\)' },
          { label: 'Serialize it with JsonSerializer.Serialize', re: 'JsonSerializer\\.Serialize\\s*\\(\\s*\\w+' },
          { label: 'Print the JSON', re: 'Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'JsonSerializer lives in System.Text.Json. Serialize(obj) returns a string.',
        explain: 'Each public property becomes a key, named exactly like the property. Numbers stay unquoted.',
        output: '{"Title":"Tomato soup","Minutes":25}',
      },
      {
        kind: 'write',
        prompt: 'Load Rex from JSON, print him, then save him a year older.',
        starter: 'using System.Text.Json;\n\nstring json = """{"Name":"Rex","Age":4}""";\n\nrecord Pet(string Name, int Age);',
        solution:
          'using System.Text.Json;\n\nstring json = """{"Name":"Rex","Age":4}""";\nPet rex = JsonSerializer.Deserialize<Pet>(json)!;\nConsole.WriteLine($"{rex.Name} is {rex.Age}");\nPet older = rex with { Age = rex.Age + 1 };\nConsole.WriteLine(JsonSerializer.Serialize(older));\n\nrecord Pet(string Name, int Age);',
        checks: [
          { label: 'Deserialize<Pet>(json) into a Pet', re: 'JsonSerializer\\.Deserialize\\s*<\\s*Pet\\s*>\\s*\\(\\s*json\\s*\\)' },
          { label: 'Print his Name and Age', re: '\\w+\\.Name[\\s\\S]*\\w+\\.Age|\\w+\\.Age[\\s\\S]*\\w+\\.Name' },
          { label: 'Make him older with with { Age = ... }', re: 'with\\s*\\{\\s*Age\\s*=' },
          { label: 'Serialize the new Pet and print it', re: 'JsonSerializer\\.Serialize\\s*\\(\\s*\\w+' },
        ],
        hint: 'Deserialize can return null, so add ! when you know the JSON is fine.',
        explain: 'Deserialize matches JSON keys to the record’s constructor, and Serialize turns the changed copy back into text.',
        output: 'Rex is 4\n{"Name":"Rex","Age":5}',
      },
    ],
    // L5 Options & attributes
    [
      {
        kind: 'write',
        prompt: 'Print a workout as indented, camelCase JSON.',
        starter: 'using System.Text.Json;\n\nrecord Workout(string Exercise, int Reps);',
        solution:
          'using System.Text.Json;\n\nvar opts = new JsonSerializerOptions\n{\n    WriteIndented = true,\n    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,\n};\nConsole.WriteLine(JsonSerializer.Serialize(new Workout("Squats", 12), opts));\n\nrecord Workout(string Exercise, int Reps);',
        checks: [
          { label: 'Create a JsonSerializerOptions', re: 'new\\s+JsonSerializerOptions\\b' },
          { label: 'Set WriteIndented = true', re: 'WriteIndented\\s*=\\s*true' },
          { label: 'Use JsonNamingPolicy.CamelCase', re: 'PropertyNamingPolicy\\s*=\\s*JsonNamingPolicy\\.CamelCase' },
          { label: 'Pass the options to Serialize', re: 'JsonSerializer\\.Serialize\\s*\\([^;]*,\\s*\\w+\\s*\\)' },
        ],
        hint: 'Set both options in one object initializer, then pass it as Serialize’s second argument.',
        explain: 'CamelCase turns Exercise into exercise, and WriteIndented puts each key on its own line, two spaces in.',
        output: '{\n  "exercise": "Squats",\n  "reps": 12\n}',
      },
      {
        kind: 'write',
        prompt: 'The weather API uses snake_case keys. Map them onto the record.',
        starter:
          'using System.Text.Json;\n\nstring json = """{"city_name":"Oslo","temp_c":12}""";\nWeather w = JsonSerializer.Deserialize<Weather>(json)!;\nConsole.WriteLine($"{w.City}: {w.TempC}C");\n\nrecord Weather(string City, int TempC);',
        solution:
          'using System.Text.Json;\nusing System.Text.Json.Serialization;\n\nstring json = """{"city_name":"Oslo","temp_c":12}""";\nWeather w = JsonSerializer.Deserialize<Weather>(json)!;\nConsole.WriteLine($"{w.City}: {w.TempC}C");\nConsole.WriteLine(JsonSerializer.Serialize(w));\n\nrecord Weather(\n    [property: JsonPropertyName("city_name")] string City,\n    [property: JsonPropertyName("temp_c")] int TempC);',
        checks: [
          { label: 'using System.Text.Json.Serialization;', re: 'using\\s+System\\.Text\\.Json\\.Serialization\\s*;' },
          { label: 'City maps to "city_name"', re: '\\[\\s*property\\s*:\\s*JsonPropertyName\\s*\\(\\s*"city_name"\\s*\\)\\s*\\]\\s*string\\s+City' },
          { label: 'TempC maps to "temp_c"', re: '\\[\\s*property\\s*:\\s*JsonPropertyName\\s*\\(\\s*"temp_c"\\s*\\)\\s*\\]\\s*int\\s+TempC' },
          { label: 'Serialize it back and print it', re: 'Console\\.WriteLine\\s*\\(\\s*JsonSerializer\\.Serialize\\s*\\(' },
        ],
        hint: 'On a record parameter the attribute needs the property: target, or it lands on the parameter instead.',
        explain: 'JsonPropertyName sets the key used both ways, so the snake_case keys now load, and they come back out the same.',
        output: 'Oslo: 12C\n{"city_name":"Oslo","temp_c":12}',
      },
    ],
  ],
};

export default unit;

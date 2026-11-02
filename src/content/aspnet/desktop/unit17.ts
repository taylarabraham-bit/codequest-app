import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 17 (Logging & observability).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Log calls that search well
    [
      {
        kind: 'write',
        prompt: 'Log the booked seat and flight as fields, and log failures with the exception.',
        starter:
          'try\n{\n    await payments.ChargeAsync(booking);\n    // log: seat and flight booked\n}\ncatch (PaymentException ex)\n{\n    // log the failure with the booking id\n}',
        solution:
          'try\n{\n    await payments.ChargeAsync(booking);\n    log.LogInformation("Booked seat {Seat} on flight {Flight}", booking.Seat, booking.Flight);\n}\ncatch (PaymentException ex)\n{\n    log.LogError(ex, "Payment for booking {BookingId} failed", booking.Id);\n}',
        checks: [
          {
            label: 'LogInformation with two {Holes} and two values',
            re: 'LogInformation\\(\\s*"[^"]*\\{\\w+\\}[^"]*\\{\\w+\\}[^"]*"\\s*,\\s*[^,;]+,\\s*[^,;]+\\)',
          },
          { label: 'LogError with the caught exception first', re: 'catch\\s*\\(\\s*\\w*Exception\\s+(\\w+)\\s*\\)[\\s\\S]*LogError\\(\\s*\\1\\s*,\\s*"' },
          { label: 'A {Hole} for the booking id in the error', re: 'LogError\\(\\s*\\w+\\s*,\\s*"[^"]*\\{\\w+\\}[^"]*"\\s*,\\s*[^)]+\\)' },
          { label: 'No $ string interpolation in log messages', not: '$"' },
        ],
        hint: 'Write the template with {Names} and pass the values after it, in the same order.',
        explain: 'Template holes become searchable fields like Seat=14C. Interpolation would bake them into one flat string.',
      },
      {
        kind: 'write',
        prompt: 'Fix the log calls: keep the stack trace and the right value in each hole.',
        starter:
          'public class Checkout(ILogger<Checkout> log)\n{\n    public void Pay(Order order)\n    {\n        try\n        {\n            Charge(order);\n            log.LogInformation("Order {OrderId} paid by {Customer}", order.Customer, order.Id);\n        }\n        catch (Exception ex)\n        {\n            log.LogError($"Order {order.Id} failed: {ex.Message}");\n        }\n    }\n}',
        solution:
          'public class Checkout(ILogger<Checkout> log)\n{\n    public void Pay(Order order)\n    {\n        try\n        {\n            Charge(order);\n            log.LogInformation("Order {OrderId} paid by {Customer}", order.Id, order.Customer);\n        }\n        catch (Exception ex)\n        {\n            log.LogError(ex, "Order {OrderId} failed", order.Id);\n        }\n    }\n}',
        checks: [
          {
            label: 'Fill holes in order: order.Id, then order.Customer',
            re: '\\{\\w+\\}\\s+paid by\\s+\\{\\w+\\}"\\s*,\\s*order\\.Id\\s*,\\s*order\\.Customer\\s*\\)',
          },
          {
            label: 'Pass ex as LogError’s first argument',
            re: 'LogError\\(\\s*(new\\s+EventId\\([^)]*\\)\\s*,\\s*|\\d+\\s*,\\s*)?ex\\s*,\\s*"',
          },
          { label: 'Use a template hole for the order id', re: 'LogError\\([^;]*"[^"]*\\{\\w+\\}[^"]*"\\s*,\\s*order\\.Id' },
          { label: 'No interpolated log message', not: '$"Order' },
        ],
        hint: 'Holes are filled by position, not by name. LogError has an overload that takes the exception first.',
        explain: 'Passing ex keeps the full stack trace in its own field; ex.Message alone loses where it failed.',
      },
    ],
    // L2 Scopes & filters
    [
      {
        kind: 'write',
        prompt: 'Tag every log about one shipment with its ShipmentId using a scope.',
        starter:
          'public void Ship(Shipment shipment)\n{\n    // log "Packing {Items} items" and "Handing to {Courier}"\n}',
        solution:
          'public void Ship(Shipment shipment)\n{\n    using (log.BeginScope("Shipment {ShipmentId}", shipment.Id))\n    {\n        log.LogInformation("Packing {Items} items", shipment.Items.Count);\n        log.LogInformation("Handing to {Courier}", shipment.Courier);\n    }\n}',
        checks: [
          {
            label: 'Open a scope with using and BeginScope("… {ShipmentId}", id)',
            re: 'using\\s*(\\(\\s*)?(var\\s+\\w+\\s*=\\s*)?\\w+\\.BeginScope\\(\\s*"[^"]*\\{ShipmentId\\}[^"]*"\\s*,\\s*[^)]+\\)',
          },
          { label: 'Two log calls inside the scope', re: 'BeginScope[\\s\\S]*\\.Log(Information|Warning|Debug)\\([\\s\\S]*\\.Log(Information|Warning|Debug)\\(' },
          { label: 'Use template holes, not interpolation', not: '$"' },
        ],
        hint: 'BeginScope returns an IDisposable; the scope lasts until the using block ends.',
        explain: 'Both lines now carry ShipmentId, so one search finds everything about that shipment without repeating the id in each message.',
      },
      {
        kind: 'write',
        prompt: 'Configure logging: Debug for Shop.Payments, silence Shop.Telemetry, show scopes on the console.',
        starter:
          '{\n  "Logging": {\n    "LogLevel": {\n      "Default": "Information",\n      "Microsoft.AspNetCore": "Warning"\n    }\n  }\n}',
        solution:
          '{\n  "Logging": {\n    "LogLevel": {\n      "Default": "Information",\n      "Microsoft.AspNetCore": "Warning",\n      "Shop.Payments": "Debug",\n      "Shop.Telemetry": "None"\n    },\n    "Console": {\n      "FormatterOptions": {\n        "IncludeScopes": true\n      }\n    }\n  }\n}',
        checks: [
          { label: '"Shop.Payments": "Debug" under LogLevel', re: '"LogLevel"\\s*:\\s*\\{[^}]*"Shop\\.Payments"\\s*:\\s*"Debug"' },
          { label: '"Shop.Telemetry": "None" under LogLevel', re: '"LogLevel"\\s*:\\s*\\{[^}]*"Shop\\.Telemetry"\\s*:\\s*"None"' },
          { label: 'Console section with "IncludeScopes": true', re: '"Console"\\s*:\\s*\\{[\\s\\S]*"IncludeScopes"\\s*:\\s*true' },
          { label: 'Keep "Default": "Information"', re: '"Default"\\s*:\\s*"Information"' },
        ],
        hint: 'Category keys match by prefix; IncludeScopes lives under Logging:Console:FormatterOptions.',
        explain: 'Shop.Payments and anything under it log from Debug up, Shop.Telemetry logs nothing, and the console prints scope fields like ShipmentId.',
      },
    ],
    // L3 Source-generated logs
    [
      {
        kind: 'write',
        prompt: 'Write a source-generated log for a gym check-in with member id and gym.',
        starter: '',
        solution:
          'public static partial class GymLog\n{\n    [LoggerMessage(Level = LogLevel.Information, Message = "Member {MemberId} checked in at {Gym}")]\n    public static partial void CheckedIn(this ILogger logger, int memberId, string gym);\n}',
        checks: [
          { label: 'A partial class', re: 'partial\\s+class\\s+\\w+' },
          { label: '[LoggerMessage] with a Level', re: '\\[LoggerMessage\\([^\\]]*Level\\s*=\\s*LogLevel\\.\\w+' },
          { label: 'A Message with two {Holes}', re: 'Message\\s*=\\s*"[^"]*\\{\\w+\\}[^"]*\\{\\w+\\}[^"]*"' },
          { label: 'A static partial void method on ILogger', re: 'static\\s+partial\\s+void\\s+\\w+\\(\\s*(this\\s+)?ILogger\\s+\\w+\\s*,' },
          {
            label: 'Each hole matches a parameter name',
            re: 'Message\\s*=\\s*"[^"]*\\{(\\w+)\\}[^"]*\\{(\\w+)\\}[\\s\\S]*partial\\s+void\\s+\\w+\\((?=[^)]*\\s\\1\\s*[,)])(?=[^)]*\\s\\2\\s*[,)])',
            flags: 'i',
          },
        ],
        hint: 'Both the class and the method are partial; the generator writes the method body.',
        explain: 'The generated method checks the level first and never boxes or re-parses the template, so it’s cheap even in hot paths.',
      },
      {
        kind: 'write',
        prompt: 'Replace the LogWarning call with a [LoggerMessage] method and call it.',
        starter:
          'public class Inventory(ILogger<Inventory> log)\n{\n    public void Reserve(string sku, int qty, int left)\n    {\n        if (qty > left)\n            log.LogWarning("Not enough {Sku}: wanted {Wanted}, have {Left}", sku, qty, left);\n    }\n}',
        solution:
          'public partial class Inventory(ILogger<Inventory> log)\n{\n    public void Reserve(string sku, int qty, int left)\n    {\n        if (qty > left)\n            LowStock(log, sku, qty, left);\n    }\n\n    [LoggerMessage(Level = LogLevel.Warning, Message = "Not enough {Sku}: wanted {Wanted}, have {Left}")]\n    private static partial void LowStock(ILogger logger, string sku, int wanted, int left);\n}',
        checks: [
          { label: 'Make Inventory partial', re: 'partial\\s+class\\s+Inventory\\b' },
          { label: '[LoggerMessage] at Warning level', re: 'LoggerMessage\\([^\\]]*Level\\s*=\\s*LogLevel\\.Warning' },
          { label: 'Keep the {Sku} template hole', re: 'Message\\s*=\\s*"[^"]*\\{Sku\\}' },
          { label: 'A static partial void method', re: 'static\\s+partial\\s+void\\s+\\w+\\(' },
          {
            label: 'Call your new method in Reserve',
            re: '^(?=[\\s\\S]*partial\\s+void\\s+(\\w+)\\s*\\()[\\s\\S]*\\b\\1\\s*\\((?!\\s*(this\\s+)?ILogger\\b)',
          },
          { label: 'No log.LogWarning( left', not: 'log.LogWarning(' },
        ],
        hint: 'A source-generated method can be private static partial in the same class, taking the ILogger.',
        explain: 'Only the class that logs needs the method, and the call reads like a named event: LowStock(…).',
      },
    ],
    // L4 Traces & spans
    [
      {
        kind: 'write',
        prompt: 'Trace incoming requests and outgoing HttpClient calls; export them with OTLP.',
        starter: 'var builder = WebApplication.CreateBuilder(args);\n',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService("library-api"))\n    .WithTracing(t => t\n        .AddAspNetCoreInstrumentation()\n        .AddHttpClientInstrumentation())\n    .UseOtlpExporter();',
        checks: [
          { label: 'builder.Services.AddOpenTelemetry()', has: 'builder.Services.AddOpenTelemetry()' },
          { label: 'Name the service in ConfigureResource', re: 'ConfigureResource\\(\\s*\\w+\\s*=>\\s*\\w+\\.AddService\\(\\s*"[\\w.-]+"' },
          { label: 'Trace ASP.NET Core requests in WithTracing', re: 'WithTracing\\([\\s\\S]*\\.AddAspNetCoreInstrumentation\\(\\)' },
          { label: 'Trace HttpClient calls', has: '.AddHttpClientInstrumentation()' },
          { label: 'Export with .UseOtlpExporter()', has: '.UseOtlpExporter()' },
        ],
        hint: 'WithTracing takes a lambda where you add instrumentation; the exporter goes on the outer chain.',
        explain: 'Every request becomes a trace with child spans for its outgoing calls, all labelled library-api in your tracing tool.',
      },
      {
        kind: 'write',
        prompt: 'Add a Cook span with an order.id tag, and register its source.',
        starter:
          'builder.Services.AddOpenTelemetry()\n    .WithTracing(t => t.AddAspNetCoreInstrumentation())\n    .UseOtlpExporter();\n\npublic class Kitchen\n{\n    public async Task CookAsync(Order order)\n    {\n        await Grill(order);\n    }\n}',
        solution:
          'builder.Services.AddOpenTelemetry()\n    .WithTracing(t => t.AddAspNetCoreInstrumentation().AddSource("Cafe.Kitchen"))\n    .UseOtlpExporter();\n\npublic class Kitchen\n{\n    public static readonly ActivitySource Source = new("Cafe.Kitchen");\n\n    public async Task CookAsync(Order order)\n    {\n        using var activity = Source.StartActivity("Cook");\n        activity?.SetTag("order.id", order.Id);\n        await Grill(order);\n    }\n}',
        checks: [
          { label: 'A static ActivitySource with a name', re: 'static\\s+readonly\\s+ActivitySource\\s+\\w+\\s*=\\s*new\\s*(ActivitySource)?\\(\\s*"[\\w.]+"\\s*\\)' },
          { label: 'Start the span with using … StartActivity', re: 'using\\s+(var\\s+\\w+\\s*=\\s*)?\\w+\\.StartActivity\\(' },
          { label: 'Tag it with ?.SetTag("order.id", …)', re: '\\w+\\?\\.SetTag\\(\\s*"order\\.id"\\s*,' },
          {
            label: 'Register the same source name with AddSource',
            re: '^(?=[\\s\\S]*ActivitySource\\s+(\\w+)\\s*=\\s*new\\s*(?:ActivitySource)?\\(\\s*"([\\w.]+)")[\\s\\S]*AddSource\\(\\s*("\\2"|\\w+\\.\\1\\.Name)\\s*\\)',
          },
        ],
        hint: 'StartActivity returns null when nobody listens, so use ?. on the result.',
        explain: 'Your Cook span appears inside the request’s trace, but only because AddSource tells OpenTelemetry to listen to Cafe.Kitchen.',
      },
    ],
    // L5 Metrics & correlation
    [
      {
        kind: 'write',
        prompt: 'Count games played with a tag, record each game’s length, and export the meter.',
        starter: '',
        solution:
          'builder.Services.AddOpenTelemetry()\n    .WithMetrics(m => m.AddMeter("Arcade.Games"))\n    .UseOtlpExporter();\n\nvar meter = new Meter("Arcade.Games");\nvar played = meter.CreateCounter<int>("arcade.games.played");\nvar length = meter.CreateHistogram<double>("arcade.game.duration", unit: "s");\n\nplayed.Add(1, new KeyValuePair<string, object?>("game", "pinball"));\nlength.Record(94.5);',
        checks: [
          { label: 'A Meter with a name', re: 'new\\s+Meter\\(\\s*"[\\w.]+"\\s*\\)' },
          { label: 'A counter with CreateCounter<int>', re: 'CreateCounter<\\s*(int|long)\\s*>\\(\\s*"[\\w.]+"' },
          { label: 'A histogram with CreateHistogram<…>', re: 'CreateHistogram<\\s*(double|float|int|long)\\s*>\\(\\s*"[\\w.]+"' },
          { label: 'Add(1, …) with a tag', re: '\\w+\\.Add\\(\\s*1\\s*,\\s*(new\\s+KeyValuePair|new\\s*\\(|\\()' },
          { label: 'Record a game length', re: '\\w+\\.Record\\(\\s*[\\w.]+' },
          { label: 'Export the meter with AddMeter', re: '^(?=[\\s\\S]*new\\s+Meter\\(\\s*"([\\w.]+)")[\\s\\S]*WithMetrics\\([\\s\\S]*AddMeter\\(\\s*"\\1"\\s*\\)' },
        ],
        hint: 'Counters Add, histograms Record; WithMetrics(m => m.AddMeter(name)) turns the meter on.',
        explain: 'The counter sums games per tag value, while the histogram keeps the spread of lengths so you can chart percentiles.',
      },
      {
        kind: 'write',
        prompt: 'Build an injectable CheckoutMetrics with a completed counter and a duration histogram.',
        starter: 'public class CheckoutMetrics(IMeterFactory factory)\n{\n}',
        solution:
          'builder.Services.AddSingleton<CheckoutMetrics>();\n\npublic class CheckoutMetrics(IMeterFactory factory)\n{\n    private readonly Counter<int> _completed = factory.Create("Shop.Checkout")\n        .CreateCounter<int>("shop.checkout.completed");\n    private readonly Histogram<double> _duration = factory.Create("Shop.Checkout")\n        .CreateHistogram<double>("shop.checkout.duration", unit: "ms");\n\n    public void Completed(double ms)\n    {\n        _completed.Add(1);\n        _duration.Record(ms);\n    }\n}',
        checks: [
          { label: 'Make the meter with factory.Create("…")', re: 'factory\\.Create\\(\\s*"[\\w.]+"\\s*\\)' },
          { label: 'A Counter<int> for completed checkouts', re: 'CreateCounter<\\s*(int|long)\\s*>\\(' },
          { label: 'A Histogram for the duration', re: 'CreateHistogram<\\s*(double|float|int|long)\\s*>\\(' },
          { label: 'A method that Adds 1 and Records the time', re: '\\.Add\\(\\s*1\\s*\\)[\\s\\S]*\\.Record\\(\\s*\\w+|\\.Record\\(\\s*\\w+[\\s\\S]*\\.Add\\(\\s*1\\s*\\)' },
          { label: 'Register it with AddSingleton<CheckoutMetrics>()', re: 'AddSingleton<\\s*CheckoutMetrics\\s*>\\(\\)' },
        ],
        hint: 'IMeterFactory.Create returns a Meter; store the instruments in fields.',
        explain: 'IMeterFactory comes from DI, so tests can swap it, and one singleton means one counter instead of one per request.',
      },
    ],
  ],
};

export default unit;

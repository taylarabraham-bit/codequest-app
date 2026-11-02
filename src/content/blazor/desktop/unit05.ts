import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 5 (Forms & validation).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 EditForm basics
    [
      {
        kind: 'write',
        prompt: 'Build a newsletter EditForm for Subscriber: an email box and a Join button.',
        starter:
          '@rendermode InteractiveServer\n\n@code {\n    public class Subscriber { public string? Email { get; set; } }\n}',
        solution:
          '@rendermode InteractiveServer\n<EditForm Model="sub" OnValidSubmit="Join">\n    <InputText @bind-Value="sub.Email" />\n    <button type="submit">Join</button>\n</EditForm>\n<p>@message</p>\n@code {\n    Subscriber sub = new();\n    string message = "";\n    void Join() => message = $"Thanks, {sub.Email}!";\n    public class Subscriber { public string? Email { get; set; } }\n}',
        checks: [
          { label: 'An EditForm whose Model is a Subscriber field', re: '<EditForm[^>]*Model="(\\w+)"[\\s\\S]*Subscriber\\s+\\1\\s*=\\s*new' },
          { label: 'OnValidSubmit runs a method', re: 'OnValidSubmit="(\\w+)"[\\s\\S]*(void|Task)\\s+\\1\\s*\\(' },
          { label: 'An InputText bound to Email with @bind-Value', re: '<InputText[^>]*@bind-Value="\\w+\\.Email"' },
          { label: 'A submit button inside the form', re: '<EditForm[\\s\\S]*<button[^>]*type="submit"[\\s\\S]*</EditForm>' },
        ],
        hint: 'Create the model with new() in @code, then point Model at it and bind the input to its Email.',
        explain: 'EditForm tracks the model, InputText edits one property, and the submit button sends the form to OnValidSubmit.',
      },
      {
        kind: 'write',
        prompt: 'Fix the bindings, and finish Add so each pet joins the list.',
        starter:
          '@rendermode InteractiveServer\n<EditForm Model="pet" OnValidSubmit="Add">\n    <InputText @bind="pet.Name" />\n    <InputText @bind="pet.Breed" />\n    <button type="submit">Add pet</button>\n</EditForm>\n<ul>\n    @foreach (var p in pets) { <li>@p.Name (@p.Breed)</li> }\n</ul>\n@code {\n    Pet pet = new();\n    List<Pet> pets = [];\n    void Add() { }\n    public class Pet { public string? Name { get; set; } public string? Breed { get; set; } }\n}',
        solution:
          '@rendermode InteractiveServer\n<EditForm Model="pet" OnValidSubmit="Add">\n    <InputText @bind-Value="pet.Name" />\n    <InputText @bind-Value="pet.Breed" />\n    <button type="submit">Add pet</button>\n</EditForm>\n<ul>\n    @foreach (var p in pets) { <li>@p.Name (@p.Breed)</li> }\n</ul>\n@code {\n    Pet pet = new();\n    List<Pet> pets = [];\n    void Add()\n    {\n        pets.Add(pet);\n        pet = new();\n    }\n    public class Pet { public string? Name { get; set; } public string? Breed { get; set; } }\n}',
        checks: [
          { label: 'Both InputTexts use @bind-Value', re: '<InputText[^>]*@bind-Value="pet\\.Name"[\\s\\S]*<InputText[^>]*@bind-Value="pet\\.Breed"' },
          { label: 'No plain @bind on an input component', not: '<InputText @bind=' },
          { label: 'Add puts the pet in the list', re: 'pets\\.Add\\(\\s*pet\\s*\\)' },
          { label: 'Then start a fresh pet', re: 'pets\\.Add\\(\\s*pet\\s*\\)\\s*;\\s*pet\\s*=\\s*new\\s*(Pet)?\\s*\\(\\s*\\)' },
        ],
        hint: 'Input components take @bind-Value, not @bind. After adding, give the form a new empty Pet.',
        explain: 'InputText exposes a Value parameter, so it binds with @bind-Value. A new Pet clears the form for the next entry.',
      },
    ],
    // L2 Input components
    [
      {
        kind: 'write',
        prompt: 'Add the right input for each Trip property, plus a Book button.',
        starter:
          '@rendermode InteractiveServer\n<EditForm Model="trip" OnValidSubmit="Book">\n</EditForm>\n@code {\n    Trip trip = new();\n    void Book() { }\n    public class Trip\n    {\n        public int Nights { get; set; } = 1;\n        public bool Breakfast { get; set; }\n        public DateTime Arrival { get; set; } = DateTime.Today;\n    }\n}',
        solution:
          '@rendermode InteractiveServer\n<EditForm Model="trip" OnValidSubmit="Book">\n    <InputNumber @bind-Value="trip.Nights" />\n    <InputCheckbox @bind-Value="trip.Breakfast" />\n    <InputDate @bind-Value="trip.Arrival" />\n    <button type="submit">Book</button>\n</EditForm>\n@code {\n    Trip trip = new();\n    void Book() { }\n    public class Trip\n    {\n        public int Nights { get; set; } = 1;\n        public bool Breakfast { get; set; }\n        public DateTime Arrival { get; set; } = DateTime.Today;\n    }\n}',
        checks: [
          { label: 'InputNumber for Nights', re: '<InputNumber[^>]*@bind-Value="trip\\.Nights"' },
          { label: 'InputCheckbox for Breakfast', re: '<InputCheckbox[^>]*@bind-Value="trip\\.Breakfast"' },
          { label: 'InputDate for Arrival', re: '<InputDate[^>]*@bind-Value="trip\\.Arrival"' },
          { label: 'A submit button', re: '<button[^>]*type="submit"' },
        ],
        hint: 'Match the component to the type: int, bool, DateTime.',
        explain: 'Each input component converts the browser’s text into the property’s type, so Nights stays an int.',
      },
      {
        kind: 'write',
        prompt: 'Finish the support form: a category list, priority radios and a details box.',
        starter:
          '@rendermode InteractiveServer\n<EditForm Model="ticket" OnValidSubmit="Send">\n    <button type="submit">Send</button>\n</EditForm>\n@code {\n    Ticket ticket = new();\n    void Send() { }\n    public enum Priority { Low, High }\n    public class Ticket\n    {\n        public string Category { get; set; } = "tech";\n        public Priority Priority { get; set; }\n        public string? Details { get; set; }\n    }\n}',
        solution:
          '@rendermode InteractiveServer\n<EditForm Model="ticket" OnValidSubmit="Send">\n    <InputSelect @bind-Value="ticket.Category">\n        <option value="billing">Billing</option>\n        <option value="tech">Tech</option>\n    </InputSelect>\n    <InputRadioGroup @bind-Value="ticket.Priority">\n        <InputRadio Value="Priority.Low" /> Low\n        <InputRadio Value="Priority.High" /> High\n    </InputRadioGroup>\n    <InputTextArea @bind-Value="ticket.Details" />\n    <button type="submit">Send</button>\n</EditForm>\n@code {\n    Ticket ticket = new();\n    void Send() { }\n    public enum Priority { Low, High }\n    public class Ticket\n    {\n        public string Category { get; set; } = "tech";\n        public Priority Priority { get; set; }\n        public string? Details { get; set; }\n    }\n}',
        checks: [
          { label: 'InputSelect bound to Category, with 2+ options', re: '<InputSelect[^>]*@bind-Value="ticket\\.Category"[^>]*>(\\s*<option[^>]*value="[^"]*"[^>]*>[^<]*</option>){2,}\\s*</InputSelect>' },
          { label: 'InputRadioGroup bound to Priority', re: '<InputRadioGroup[^>]*@bind-Value="ticket\\.Priority"' },
          { label: 'An InputRadio for each priority', re: '<InputRadio\\s[^>]*Value="Priority\\.Low"[\\s\\S]*<InputRadio\\s[^>]*Value="Priority\\.High"|<InputRadio\\s[^>]*Value="Priority\\.High"[\\s\\S]*<InputRadio\\s[^>]*Value="Priority\\.Low"' },
          { label: 'InputTextArea for Details', re: '<InputTextArea[^>]*@bind-Value="ticket\\.Details"' },
        ],
        hint: 'InputSelect wraps <option> tags; InputRadioGroup wraps InputRadio tags, each with a Value.',
        explain: 'The group binds once to the property, and the checked InputRadio’s Value is what gets stored.',
      },
    ],
    // L3 Validation attributes
    [
      {
        kind: 'write',
        prompt: 'Add rules: Name required and at most 30 chars, Age 18–99, a valid Email.',
        starter:
          'public class Member\n{\n    public string? Name { get; set; }\n    public int Age { get; set; }\n    public string? Email { get; set; }\n}',
        solution:
          'using System.ComponentModel.DataAnnotations;\n\npublic class Member\n{\n    [Required, StringLength(30)]\n    public string? Name { get; set; }\n\n    [Range(18, 99)]\n    public int Age { get; set; }\n\n    [Required, EmailAddress]\n    public string? Email { get; set; }\n}',
        checks: [
          { label: 'using System.ComponentModel.DataAnnotations;', has: 'using System.ComponentModel.DataAnnotations;' },
          { label: 'Name: [Required] and [StringLength(30)]', re: '(?=[^;{}]*Required)[^;{}]*StringLength\\(\\s*30\\s*\\)[^;{}]*public\\s+string\\??\\s+Name|Required[^;{}]*StringLength\\(\\s*30\\s*\\)[^;{}]*public\\s+string\\??\\s+Name' },
          { label: 'Age: [Range(18, 99)]', re: 'Range\\(\\s*18\\s*,\\s*99\\s*\\)[^;{}]*public\\s+int\\s+Age' },
          { label: 'Email: [EmailAddress]', re: 'EmailAddress[^;{}]*public\\s+string\\??\\s+Email' },
        ],
        hint: 'Attributes sit in [ ] above each property; several can share one pair of brackets.',
        explain: 'The rules live on the model, so every form that edits a Member checks them the same way.',
      },
      {
        kind: 'write',
        prompt: 'Turn on validation and give Guests a friendly error message.',
        starter:
          '@rendermode InteractiveServer\n<EditForm Model="booking" OnValidSubmit="Book">\n    <ValidationSummary />\n    <InputNumber @bind-Value="booking.Guests" />\n    <button type="submit">Book table</button>\n</EditForm>\n@code {\n    Booking booking = new();\n    void Book() { }\n    public class Booking\n    {\n        [Range(1, 8)]\n        public int Guests { get; set; }\n    }\n}',
        solution:
          '@rendermode InteractiveServer\n@using System.ComponentModel.DataAnnotations\n<EditForm Model="booking" OnValidSubmit="Book">\n    <DataAnnotationsValidator />\n    <ValidationSummary />\n    <InputNumber @bind-Value="booking.Guests" />\n    <button type="submit">Book table</button>\n</EditForm>\n@code {\n    Booking booking = new();\n    void Book() { }\n    public class Booking\n    {\n        [Range(1, 8, ErrorMessage = "Tables seat 1 to 8 guests.")]\n        public int Guests { get; set; }\n    }\n}',
        checks: [
          { label: 'Add <DataAnnotationsValidator /> inside the form', re: '<EditForm[\\s\\S]*<DataAnnotationsValidator\\s*/>[\\s\\S]*</EditForm>' },
          { label: 'Import the attributes with @using', has: '@using System.ComponentModel.DataAnnotations' },
          { label: 'Range(1, 8) with an ErrorMessage', re: 'Range\\(\\s*1\\s*,\\s*8\\s*,\\s*ErrorMessage\\s*=\\s*"[^"]+"\\s*\\)' },
        ],
        hint: 'Without the validator component, EditForm ignores the attributes. ErrorMessage goes inside Range( ).',
        explain: 'DataAnnotationsValidator reads the attributes, and ErrorMessage replaces the default text in the summary.',
      },
    ],
    // L4 Showing errors
    [
      {
        kind: 'write',
        prompt: 'Show each field’s error under it, and warn on an invalid submit.',
        starter:
          '@rendermode InteractiveServer\n<EditForm Model="login" OnValidSubmit="SignIn">\n    <DataAnnotationsValidator />\n    <InputText @bind-Value="login.User" />\n    <InputText type="password" @bind-Value="login.Password" />\n    <button type="submit">Sign in</button>\n</EditForm>\n<p>@status</p>\n@code {\n    LoginModel login = new();\n    string status = "";\n    void SignIn() => status = "Welcome!";\n}',
        solution:
          '@rendermode InteractiveServer\n<EditForm Model="login" OnValidSubmit="SignIn" OnInvalidSubmit="Warn">\n    <DataAnnotationsValidator />\n    <InputText @bind-Value="login.User" />\n    <ValidationMessage For="() => login.User" />\n    <InputText type="password" @bind-Value="login.Password" />\n    <ValidationMessage For="() => login.Password" />\n    <button type="submit">Sign in</button>\n</EditForm>\n<p>@status</p>\n@code {\n    LoginModel login = new();\n    string status = "";\n    void SignIn() => status = "Welcome!";\n    void Warn() => status = "Check the form.";\n}',
        checks: [
          { label: 'A ValidationMessage for login.User', re: '<ValidationMessage\\s+For="\\(\\)\\s*=>\\s*login\\.User"\\s*/>' },
          { label: 'A ValidationMessage for login.Password', re: '<ValidationMessage\\s+For="\\(\\)\\s*=>\\s*login\\.Password"\\s*/>' },
          { label: 'OnInvalidSubmit runs a method', re: 'OnInvalidSubmit="(\\w+)"[\\s\\S]*(void|Task)\\s+\\1\\s*\\(' },
          { label: 'That method sets a warning', re: 'OnInvalidSubmit="(\\w+)"[\\s\\S]*\\1\\s*\\(\\s*\\)\\s*(=>|\\{)\\s*\\w+\\s*=\\s*"[^"]+"' },
        ],
        hint: 'For takes a lambda that points at the property: () => login.User.',
        explain: 'ValidationMessage shows one field’s errors where you put it; OnInvalidSubmit runs when any rule fails.',
      },
      {
        kind: 'write',
        prompt: 'This form throws. Fix its events and list all errors above the field.',
        starter:
          '@rendermode InteractiveServer\n<EditForm Model="order" OnSubmit="Check" OnValidSubmit="Pay">\n    <DataAnnotationsValidator />\n    <InputText @bind-Value="order.Card" />\n    <button type="submit">Pay</button>\n</EditForm>\n<p>@status</p>\n@code {\n    Order order = new();\n    string status = "";\n    void Check() => status = "Fix the card number.";\n    void Pay() => status = "Paid!";\n}',
        solution:
          '@rendermode InteractiveServer\n<EditForm Model="order" OnInvalidSubmit="Check" OnValidSubmit="Pay">\n    <DataAnnotationsValidator />\n    <ValidationSummary />\n    <InputText @bind-Value="order.Card" />\n    <button type="submit">Pay</button>\n</EditForm>\n<p>@status</p>\n@code {\n    Order order = new();\n    string status = "";\n    void Check() => status = "Fix the card number.";\n    void Pay() => status = "Paid!";\n}',
        checks: [
          { label: 'Don’t mix OnSubmit with OnValidSubmit', not: 'OnSubmit=' },
          { label: 'Keep OnValidSubmit="Pay"', has: 'OnValidSubmit="Pay"' },
          { label: 'Run Check on OnInvalidSubmit', has: 'OnInvalidSubmit="Check"' },
          { label: '<ValidationSummary /> above the input', re: '<ValidationSummary\\s*/>[\\s\\S]*<InputText' },
        ],
        hint: 'OnSubmit skips validation, so it can’t be combined. Which event pairs with OnValidSubmit?',
        explain: 'OnValidSubmit and OnInvalidSubmit split one validated submit in two; OnSubmit is the do-it-yourself alternative.',
      },
    ],
    // L5 Static SSR forms
    [
      {
        kind: 'write',
        prompt: 'Write a static /feedback page whose form fills its model from the POST.',
        starter: '',
        solution:
          '@page "/feedback"\n<EditForm Model="Model" FormName="feedback" OnValidSubmit="Send">\n    <InputTextArea @bind-Value="Model!.Comment" />\n    <button type="submit">Send</button>\n</EditForm>\n@if (sent)\n{\n    <p>Thanks!</p>\n}\n@code {\n    [SupplyParameterFromForm] private Feedback? Model { get; set; }\n    bool sent;\n    protected override void OnInitialized() => Model ??= new();\n    void Send() => sent = true;\n}',
        checks: [
          { label: 'A page with @page "/feedback" and no @rendermode', re: '^(?![\\s\\S]*@rendermode)[\\s\\S]*@page\\s+"/feedback"' },
          { label: 'Give the EditForm a FormName', re: '<EditForm[^>]*FormName="[^"]+"' },
          { label: 'A [SupplyParameterFromForm] model property', re: '\\[SupplyParameterFromForm\\]\\s*(private\\s+|public\\s+)?\\w+\\??\\s+(\\w+)\\s*\\{\\s*get;\\s*set;\\s*\\}' },
          { label: 'Create it with ??= new() in OnInitialized', re: 'OnInitialized\\(\\)[\\s\\S]*\\w+\\s*\\?\\?=\\s*new' },
        ],
        hint: 'FormName on EditForm, [SupplyParameterFromForm] on a property, and ??= so posted values survive.',
        explain: 'A static form posts back to the server; FormName routes the POST and the attribute fills the model from it.',
      },
      {
        kind: 'write',
        prompt: 'Posting this static form loses the answers. Fix it.',
        starter:
          '@page "/rsvp"\n<EditForm Model="Rsvp" OnValidSubmit="Save">\n    <InputText @bind-Value="Rsvp!.Name" />\n    <InputCheckbox @bind-Value="Rsvp!.Coming" />\n    <button type="submit">Reply</button>\n</EditForm>\n<p>@reply</p>\n@code {\n    private RsvpForm? Rsvp { get; set; }\n    string reply = "";\n    protected override void OnInitialized() => Rsvp = new();\n    void Save() => reply = Rsvp!.Coming ? $"See you, {Rsvp.Name}!" : "Maybe next time.";\n}',
        solution:
          '@page "/rsvp"\n<EditForm Model="Rsvp" FormName="rsvp" OnValidSubmit="Save">\n    <InputText @bind-Value="Rsvp!.Name" />\n    <InputCheckbox @bind-Value="Rsvp!.Coming" />\n    <button type="submit">Reply</button>\n</EditForm>\n<p>@reply</p>\n@code {\n    [SupplyParameterFromForm]\n    private RsvpForm? Rsvp { get; set; }\n    string reply = "";\n    protected override void OnInitialized() => Rsvp ??= new();\n    void Save() => reply = Rsvp!.Coming ? $"See you, {Rsvp.Name}!" : "Maybe next time.";\n}',
        checks: [
          { label: 'Add a FormName to the EditForm', re: '<EditForm[^>]*FormName="[^"]+"' },
          { label: 'Mark Rsvp with [SupplyParameterFromForm]', re: '\\[SupplyParameterFromForm\\]\\s*(private\\s+|public\\s+)?RsvpForm\\??\\s+Rsvp\\b' },
          { label: 'Keep posted values with Rsvp ??= new()', re: 'Rsvp\\s*\\?\\?=\\s*new' },
          { label: 'Stay static: no @rendermode', not: '@rendermode' },
        ],
        hint: 'Three pieces: FormName, the form attribute on the property, and ??= instead of =.',
        explain: 'OnInitialized runs after the posted values arrive, so = new() wiped them; ??= only creates a model when none was posted.',
      },
    ],
  ],
};

export default unit;

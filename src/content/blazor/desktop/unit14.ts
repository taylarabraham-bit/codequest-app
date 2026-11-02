import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 14 (QuickGrid & virtualization).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first QuickGrid
    [
      {
        kind: 'write',
        prompt: 'Show the books in a QuickGrid with a Title column and a formatted Price.',
        starter: `@code {
    record Book(string Title, decimal Price);
    IQueryable<Book> books = new[] { new Book("Dune", 9.99m), new Book("Emma", 4.5m) }.AsQueryable();
}`,
        solution: `@using Microsoft.AspNetCore.Components.QuickGrid

<QuickGrid Items="books">
    <PropertyColumn Property="@(b => b.Title)" />
    <PropertyColumn Property="@(b => b.Price)" Format="0.00" />
</QuickGrid>

@code {
    record Book(string Title, decimal Price);
    IQueryable<Book> books = new[] { new Book("Dune", 9.99m), new Book("Emma", 4.5m) }.AsQueryable();
}`,
        checks: [
          { label: '@using Microsoft.AspNetCore.Components.QuickGrid', has: '@using Microsoft.AspNetCore.Components.QuickGrid' },
          { label: '<QuickGrid Items="books">', re: String.raw`<QuickGrid\s[^<]*Items="@?books"` },
          { label: 'A PropertyColumn for Title', re: String.raw`<PropertyColumn\s[^<]*Property="@?\(?\s*(\w+)\s*=>\s*\1\.Title\b` },
          { label: 'A PropertyColumn for Price with a Format', re: String.raw`<PropertyColumn(?=[^<]*\.Price\b)(?=[^<]*Format="[^"]+")` },
        ],
        hint: 'One <PropertyColumn Property="@(b => b.X)" /> per column; Format takes a .NET format string.',
        explain: 'QuickGrid reads the column header from the property name, and Format="0.00" prints prices with two decimals.',
      },
      {
        kind: 'write',
        prompt: 'Fix the runs grid: queryable items, titled columns and formatted values.',
        starter: `@using Microsoft.AspNetCore.Components.QuickGrid

<QuickGrid Items="runs">
    <PropertyColumn Property="@(r => r.Date)" />
    <PropertyColumn Property="@(r => r.Km)" />
</QuickGrid>

@code {
    record Run(DateOnly Date, double Km);
    List<Run> runs = [new(new DateOnly(2026, 10, 1), 5.2), new(new DateOnly(2026, 10, 3), 8)];
}`,
        solution: `@using Microsoft.AspNetCore.Components.QuickGrid

<QuickGrid Items="runs">
    <PropertyColumn Property="@(r => r.Date)" Title="Day" Format="dd MMM" />
    <PropertyColumn Property="@(r => r.Km)" Title="Distance (km)" Format="0.0" />
</QuickGrid>

@code {
    record Run(DateOnly Date, double Km);
    IQueryable<Run> runs = new List<Run> { new(new DateOnly(2026, 10, 1), 5.2), new(new DateOnly(2026, 10, 3), 8) }.AsQueryable();
}`,
        checks: [
          { label: 'Items must be an IQueryable: use AsQueryable()', re: String.raw`\.AsQueryable\(\)` },
          { label: 'A Title on the date column', re: String.raw`<PropertyColumn(?=[^<]*\.Date\b)(?=[^<]*Title="[^"]+")` },
          { label: 'A Format on the date column', re: String.raw`<PropertyColumn(?=[^<]*\.Date\b)(?=[^<]*Format="[^"]+")` },
          { label: 'A Title on the distance column', re: String.raw`<PropertyColumn(?=[^<]*\.Km\b)(?=[^<]*Title="[^"]+")` },
          { label: 'A Format on the distance column', re: String.raw`<PropertyColumn(?=[^<]*\.Km\b)(?=[^<]*Format="[^"]+")` },
        ],
        hint: 'A List isn’t an IQueryable; .AsQueryable() turns it into one. Then add Title and Format to each column.',
        explain: 'QuickGrid sorts and pages through IQueryable, so in-memory lists need AsQueryable(); Format works on any IFormattable value.',
      },
    ],
    // L2 Sorting & templates
    [
      {
        kind: 'write',
        prompt: 'Make both columns sortable, starting with the highest score first.',
        starter: `@rendermode InteractiveServer
@using Microsoft.AspNetCore.Components.QuickGrid

<QuickGrid Items="players">
    <PropertyColumn Property="@(p => p.Name)" />
    <PropertyColumn Property="@(p => p.Score)" />
</QuickGrid>`,
        solution: `@rendermode InteractiveServer
@using Microsoft.AspNetCore.Components.QuickGrid

<QuickGrid Items="players">
    <PropertyColumn Property="@(p => p.Name)" Sortable="true" />
    <PropertyColumn Property="@(p => p.Score)" Sortable="true" IsDefaultSortColumn="true"
        InitialSortDirection="SortDirection.Descending" />
</QuickGrid>`,
        checks: [
          { label: 'Name is Sortable', re: String.raw`<PropertyColumn(?=[^<]*\.Name\b)(?=[^<]*Sortable="true")` },
          { label: 'Score is Sortable', re: String.raw`<PropertyColumn(?=[^<]*\.Score\b)(?=[^<]*Sortable="true")` },
          { label: 'Score is the default sort column', re: String.raw`<PropertyColumn(?=[^<]*\.Score\b)(?=[^<]*IsDefaultSortColumn="true")` },
          {
            label: 'It starts Descending',
            re: String.raw`<PropertyColumn(?=[^<]*\.Score\b)(?=[^<]*InitialSortDirection="SortDirection\.Descending")`,
          },
        ],
        hint: 'Sortable="true" on each column; IsDefaultSortColumn and InitialSortDirection on Score.',
        explain: 'The grid sorts by Score high-to-low on load, and clicking a header re-sorts because the page is interactive.',
      },
      {
        kind: 'write',
        prompt: 'Add a Stock column that shows a badge and sorts by stock count.',
        starter: `<QuickGrid Items="products">
    <PropertyColumn Property="@(p => p.Name)" Sortable="true" />
</QuickGrid>

@code {
    IQueryable<Product> products = Product.Catalog.AsQueryable();
}`,
        solution: `<QuickGrid Items="products">
    <PropertyColumn Property="@(p => p.Name)" Sortable="true" />
    <TemplateColumn Title="Stock" SortBy="byStock">
        <span class="@(context.Stock == 0 ? "badge out" : "badge")">@context.Stock left</span>
    </TemplateColumn>
</QuickGrid>

@code {
    IQueryable<Product> products = Product.Catalog.AsQueryable();
    GridSort<Product> byStock = GridSort<Product>.ByDescending(p => p.Stock);
}`,
        checks: [
          { label: 'A TemplateColumn titled Stock', re: String.raw`<TemplateColumn(?=[^<]*Title="Stock")` },
          { label: 'It shows @context.Stock', re: String.raw`<TemplateColumn[\s\S]*@context\.Stock[\s\S]*</TemplateColumn>` },
          { label: 'Give it a SortBy', re: String.raw`<TemplateColumn[^<]*SortBy="@?\w+"` },
          {
            label: 'Build the sort with GridSort<Product>',
            re: String.raw`GridSort<Product>\s+\w+\s*=\s*GridSort<Product>\.By(Ascending|Descending)\(\s*(\w+)\s*=>\s*\2\.Stock\s*\)`,
          },
        ],
        hint: 'Inside a TemplateColumn, context is the row. SortBy needs a GridSort<Product> field.',
        explain: 'A TemplateColumn can show any markup, so the grid can’t guess how to sort it; GridSort tells it which value to use.',
      },
    ],
    // L3 Paging & filtering
    [
      {
        kind: 'write',
        prompt: 'Page the invoices grid, 20 rows per page, with a Paginator below.',
        starter: `<QuickGrid Items="invoices">
    <PropertyColumn Property="@(i => i.Number)" />
    <PropertyColumn Property="@(i => i.Total)" Format="0.00" />
</QuickGrid>

@code {
    IQueryable<Invoice> invoices = Invoice.Samples.AsQueryable();
}`,
        solution: `<QuickGrid Items="invoices" Pagination="pagination">
    <PropertyColumn Property="@(i => i.Number)" />
    <PropertyColumn Property="@(i => i.Total)" Format="0.00" />
</QuickGrid>
<Paginator State="pagination" />

@code {
    IQueryable<Invoice> invoices = Invoice.Samples.AsQueryable();
    PaginationState pagination = new() { ItemsPerPage = 20 };
}`,
        checks: [
          { label: 'A PaginationState with ItemsPerPage = 20', re: String.raw`PaginationState\s+(\w+)\s*=\s*new(\s+PaginationState)?\s*(\(\s*\))?\s*\{\s*ItemsPerPage\s*=\s*20\s*\}` },
          { label: 'Pass it to the grid’s Pagination', re: String.raw`<QuickGrid\s[^<]*Pagination="@?(\w+)"[\s\S]*PaginationState\s+\1\b` },
          { label: 'A <Paginator State="…" /> using the same state', re: String.raw`<Paginator\s+State="@?(\w+)"\s*/>[\s\S]*PaginationState\s+\1\b` },
        ],
        hint: 'One PaginationState field, given to both the grid and the Paginator.',
        explain: 'The grid and the Paginator share the state object: the Paginator changes the page and the grid shows it.',
      },
      {
        kind: 'write',
        prompt: 'Add a search box that filters recipes by name as you type.',
        starter: `@rendermode InteractiveServer

<QuickGrid Items="recipes">
    <PropertyColumn Property="@(r => r.Name)" />
</QuickGrid>

@code {
    IQueryable<Recipe> recipes = Recipe.All.AsQueryable();
}`,
        solution: `@rendermode InteractiveServer

<input placeholder="Search" @bind="search" @bind:event="oninput" />

<QuickGrid Items="Filtered">
    <PropertyColumn Property="@(r => r.Name)" />
</QuickGrid>

@code {
    IQueryable<Recipe> recipes = Recipe.All.AsQueryable();
    string search = "";
    IQueryable<Recipe> Filtered =>
        recipes.Where(r => r.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
}`,
        checks: [
          { label: 'An input bound to a search field', re: String.raw`<input\b[^<]*@bind(-value)?="@?(\w+)"` },
          { label: 'Update on every key with @bind:event="oninput"', re: String.raw`@bind(-value)?:event="oninput"` },
          { label: 'A Filtered property using Where', re: String.raw`IQueryable<Recipe>\s+(\w+)\s*=>\s*recipes\.Where\(` },
          { label: 'Match names with Contains(search…)', re: String.raw`\.Name\.Contains\(\s*\w+` },
          { label: 'The grid uses the filtered items', re: String.raw`<QuickGrid\s[^<]*Items="@?(\w+)"[\s\S]*IQueryable<Recipe>\s+\1\s*=>` },
        ],
        hint: 'Make Items a property (=>) so the Where runs again on every render.',
        explain: 'An expression-bodied property re-filters each time the input changes and the component renders.',
      },
    ],
    // L4 Loading on demand
    [
      {
        kind: 'write',
        prompt: 'Load support tickets on demand from the API with an ItemsProvider.',
        starter: `@inject TicketApi Api

@code {
}`,
        solution: `@inject TicketApi Api

<QuickGrid ItemsProvider="LoadTickets" Virtualize="true">
    <PropertyColumn Property="@(t => t.Id)" />
    <PropertyColumn Property="@(t => t.Subject)" />
</QuickGrid>

@code {
    async ValueTask<GridItemsProviderResult<Ticket>> LoadTickets(GridItemsProviderRequest<Ticket> req)
    {
        var page = await Api.GetTicketsAsync(req.StartIndex, req.Count ?? 50);
        return GridItemsProviderResult.From(page.Items, page.Total);
    }
}`,
        checks: [
          { label: 'Give the grid ItemsProvider and Virtualize="true"', re: String.raw`<QuickGrid(?=[^<]*ItemsProvider="@?\w+")(?=[^<]*Virtualize="true")` },
          {
            label: 'A method returning ValueTask<GridItemsProviderResult<Ticket>>',
            re: String.raw`ValueTask<GridItemsProviderResult<Ticket>>\s+(\w+)\(\s*GridItemsProviderRequest<Ticket>\s+\w+\s*\)`,
          },
          { label: 'Pass StartIndex and Count to the API', re: String.raw`\w+\.StartIndex[\s\S]*\w+\.Count` },
          { label: 'Return GridItemsProviderResult.From(items, total)', re: String.raw`GridItemsProviderResult\.From\(` },
          { label: 'The grid names that method', re: String.raw`ItemsProvider="@?(\w+)"[\s\S]*GridItemsProviderResult<Ticket>>\s+\1\(` },
        ],
        hint: 'The request says where to start and how many rows to fetch; the result also carries the total count.',
        explain: 'With an ItemsProvider the grid asks for only the rows it shows, so a million tickets never load at once.',
      },
      {
        kind: 'write',
        prompt: 'Finish LoadOrders: sort, page and count the orders in the database.',
        starter: `@inject IDbContextFactory<ShopDb> DbFactory

<QuickGrid ItemsProvider="LoadOrders" Pagination="pages">
    <PropertyColumn Property="@(o => o.PlacedOn)" Sortable="true" />
</QuickGrid>
<Paginator State="pages" />

@code {
    PaginationState pages = new() { ItemsPerPage = 25 };

    async ValueTask<GridItemsProviderResult<Order>> LoadOrders(GridItemsProviderRequest<Order> req)
    {
        throw new NotImplementedException();
    }
}`,
        solution: `@inject IDbContextFactory<ShopDb> DbFactory

<QuickGrid ItemsProvider="LoadOrders" Pagination="pages">
    <PropertyColumn Property="@(o => o.PlacedOn)" Sortable="true" />
</QuickGrid>
<Paginator State="pages" />

@code {
    PaginationState pages = new() { ItemsPerPage = 25 };

    async ValueTask<GridItemsProviderResult<Order>> LoadOrders(GridItemsProviderRequest<Order> req)
    {
        await using var db = DbFactory.CreateDbContext();
        var query = req.ApplySorting(db.Orders);
        var total = await query.CountAsync(req.CancellationToken);
        var items = await query.Skip(req.StartIndex).Take(req.Count ?? 25).ToListAsync(req.CancellationToken);
        return GridItemsProviderResult.From(items, total);
    }
}`,
        checks: [
          { label: 'Apply the grid’s sort with req.ApplySorting', re: String.raw`\w+\.ApplySorting\(` },
          { label: 'Count all matching rows with CountAsync', re: String.raw`\.CountAsync\(` },
          { label: 'Skip(req.StartIndex)', re: String.raw`\.Skip\(\s*\w+\.StartIndex\s*\)` },
          { label: 'Take(req.Count …)', re: String.raw`\.Take\(\s*\w+\.Count\b` },
          { label: 'Return GridItemsProviderResult.From', re: String.raw`return\s+GridItemsProviderResult\.From\(` },
          { label: 'No NotImplementedException left', not: 'NotImplementedException' },
        ],
        hint: 'Sort first, count, then Skip and Take for the page. A fresh DbContext from the factory per call.',
        explain: 'EF Core turns ApplySorting, Skip and Take into one SQL query, so only one page of orders leaves the database.',
      },
    ],
    // L5 Virtualize in depth
    [
      {
        kind: 'write',
        prompt: 'Virtualize the chat messages with a 56px row size and 4 overscan rows.',
        starter: `<div class="chat" style="height: 400px; overflow-y: auto">
</div>

@code {
    List<Message> messages = [];
}`,
        solution: `<div class="chat" style="height: 400px; overflow-y: auto">
    <Virtualize Items="messages" Context="msg" ItemSize="56" OverscanCount="4">
        <p>@msg.From: @msg.Text</p>
    </Virtualize>
</div>

@code {
    List<Message> messages = [];
}`,
        checks: [
          { label: '<Virtualize Items="messages">', re: String.raw`<Virtualize(?=[^<]*Items="@?messages")` },
          { label: 'ItemSize="56"', re: String.raw`<Virtualize(?=[^<]*ItemSize="56")` },
          { label: 'OverscanCount="4"', re: String.raw`<Virtualize(?=[^<]*OverscanCount="4")` },
          { label: 'Show each message’s text', re: String.raw`<Virtualize[\s\S]*@\w+\.Text[\s\S]*</Virtualize>` },
        ],
        hint: 'All three settings are attributes on <Virtualize>. Context names each message.',
        explain: 'ItemSize helps Virtualize estimate the scroll height before rows are measured; overscan keeps scrolling smooth.',
      },
      {
        kind: 'write',
        prompt: 'Load songs on demand and show a placeholder while rows load.',
        starter: `@inject SongApi Api

<Virtualize ItemsProvider="LoadSongs" Context="song">
    <p>@song.Title</p>
</Virtualize>

@code {
}`,
        solution: `@inject SongApi Api

<Virtualize ItemsProvider="LoadSongs" Context="song">
    <ItemContent><p>@song.Title</p></ItemContent>
    <Placeholder><p class="ghost">Loading…</p></Placeholder>
</Virtualize>

@code {
    async ValueTask<ItemsProviderResult<Song>> LoadSongs(ItemsProviderRequest req)
    {
        var page = await Api.GetSongsAsync(req.StartIndex, req.Count, req.CancellationToken);
        return new ItemsProviderResult<Song>(page.Items, page.Total);
    }
}`,
        checks: [
          { label: 'Move the row into <ItemContent>', re: String.raw`<ItemContent>[\s\S]*@\w+\.Title[\s\S]*</ItemContent>` },
          { label: 'A <Placeholder> for rows still loading', re: String.raw`<Placeholder>[\s\S]*\w[\s\S]*</Placeholder>` },
          {
            label: 'LoadSongs returns ValueTask<ItemsProviderResult<Song>>',
            re: String.raw`ValueTask<ItemsProviderResult<Song>>\s+LoadSongs\(\s*ItemsProviderRequest\s+\w+\s*\)`,
          },
          { label: 'Use the request’s StartIndex and Count', re: String.raw`\w+\.StartIndex[\s\S]*\w+\.Count\b` },
          { label: 'Return new ItemsProviderResult<Song>(items, total)', re: String.raw`new\s+ItemsProviderResult<Song>\(` },
        ],
        hint: 'With a Placeholder, the row template must be named ItemContent. The provider gets an ItemsProviderRequest.',
        explain: 'Virtualize asks the provider only for rows near the view, and shows Placeholder until they arrive.',
      },
    ],
  ],
};

export default unit;

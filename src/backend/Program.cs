var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpClient();

// Azure OpenAI
var openAIEndpoint = builder.Configuration["AzureOpenAI:Endpoint"];
if (!string.IsNullOrEmpty(openAIEndpoint))
{
    var tenantId = builder.Configuration["AzureOpenAI:TenantId"];
    var credentialOptions = new Azure.Identity.DefaultAzureCredentialOptions();
    if (!string.IsNullOrEmpty(tenantId))
    {
        credentialOptions.TenantId = tenantId;
    }
    
    builder.Services.AddSingleton(new Azure.AI.OpenAI.AzureOpenAIClient(
        new Uri(openAIEndpoint),
        new Azure.Identity.DefaultAzureCredential(credentialOptions)));
}

builder.Services.AddHttpClient<backend.Services.AniListService>();
builder.Services.AddScoped<backend.Services.IAniListService, backend.Services.AniListService>();

if (!string.IsNullOrEmpty(openAIEndpoint))
    builder.Services.AddScoped<backend.Services.IRecommendationService, backend.Services.RecommendationService>();
else
    builder.Services.AddScoped<backend.Services.IRecommendationService, backend.Services.NullRecommendationService>();

builder.Services.AddResponseCompression();
builder.Services.AddMemoryCache();

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = builder.Environment.IsDevelopment()
        ? Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.All
        : Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.RequestPath
          | Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.ResponseStatusCode;
    logging.MediaTypeOptions.AddText("application/json");
});

// read the allowed frontend origin from configuration so we can
// update it in production without recompiling (and keep localhost
// working for local dev).
var frontendUrl = builder.Configuration["FrontendUrl"]
                 ?? "http://localhost:3000";

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(frontendUrl, "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseResponseCompression();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseHttpLogging();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();

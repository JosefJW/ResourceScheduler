namespace ResourceScheduler.Dtos;

public record CreateItem(
	long FamilyId,
    string Name = "",
	string Type = ""
);
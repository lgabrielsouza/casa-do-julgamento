package br.org.casadojulgamento.api.dto.group;

public record ParticipantGroupGenerationResult(

        int createdGroups,

        int addedParticipants,

        int ignoredParticipants,

        int formingGroups,

        int readyGroups

) {
}
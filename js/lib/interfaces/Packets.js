export var PlayerVoteAreaFlags;
(function (PlayerVoteAreaFlags) {
    PlayerVoteAreaFlags[PlayerVoteAreaFlags["VotedFor"] = 15] = "VotedFor";
    PlayerVoteAreaFlags[PlayerVoteAreaFlags["DidReport"] = 32] = "DidReport";
    PlayerVoteAreaFlags[PlayerVoteAreaFlags["DidVote"] = 64] = "DidVote";
    PlayerVoteAreaFlags[PlayerVoteAreaFlags["IsDead"] = 128] = "IsDead";
})(PlayerVoteAreaFlags || (PlayerVoteAreaFlags = {}));

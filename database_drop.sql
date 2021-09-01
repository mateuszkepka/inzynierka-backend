-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2021-09-01 17:09:03.117

-- foreign keys
ALTER TABLE ActiveRoster
    DROP CONSTRAINT ActiveRoster_Player;

ALTER TABLE ActiveRoster
    DROP CONSTRAINT ActiveRoster_Roster;

ALTER TABLE GroupRule
    DROP CONSTRAINT GroupRule_Group;

ALTER TABLE GroupRule
    DROP CONSTRAINT GroupRule_TiebreakerRule;

ALTER TABLE GroupStanding
    DROP CONSTRAINT GroupStanding_Group;

ALTER TABLE GroupStanding
    DROP CONSTRAINT GroupStanding_Roster;

ALTER TABLE "Group"
    DROP CONSTRAINT Group_Tournament;

ALTER TABLE LadderStanding
    DROP CONSTRAINT LadderStanding_Ladder;

ALTER TABLE LadderStanding
    DROP CONSTRAINT LadderStanding_Roster;

ALTER TABLE Ladder
    DROP CONSTRAINT Ladder_Tournament;

ALTER TABLE Map
    DROP CONSTRAINT Map_Match;

ALTER TABLE Match
    DROP CONSTRAINT Match_Roster;

ALTER TABLE Match
    DROP CONSTRAINT Match_Roster2;

ALTER TABLE Match
    DROP CONSTRAINT Match_Tournament;

ALTER TABLE Performance
    DROP CONSTRAINT Performance_Map;

ALTER TABLE Performance
    DROP CONSTRAINT Performance_Player;

ALTER TABLE Player
    DROP CONSTRAINT Player_Game;

ALTER TABLE Player
    DROP CONSTRAINT Player_Team;

ALTER TABLE Player
    DROP CONSTRAINT Player_User;

ALTER TABLE Roster
    DROP CONSTRAINT Roster_Team;

ALTER TABLE Suspension
    DROP CONSTRAINT Suspension_User;

ALTER TABLE Team
    DROP CONSTRAINT Team_Player;

ALTER TABLE TournamentAdmin
    DROP CONSTRAINT TournamentAdmin_Tournament;

ALTER TABLE TournamentAdmin
    DROP CONSTRAINT TournamentAdmin_User;

ALTER TABLE Tournament
    DROP CONSTRAINT Tournament_Game;

ALTER TABLE Tournament
    DROP CONSTRAINT Tournament_Preset;

ALTER TABLE Tournament
    DROP CONSTRAINT Tournament_Prize;

ALTER TABLE Tournament
    DROP CONSTRAINT Tournament_User;

-- tables
DROP TABLE ActiveRoster;

DROP TABLE Game;

DROP TABLE "Group";

DROP TABLE GroupRule;

DROP TABLE GroupStanding;

DROP TABLE Ladder;

DROP TABLE LadderStanding;

DROP TABLE Map;

DROP TABLE Match;

DROP TABLE Performance;

DROP TABLE Player;

DROP TABLE Preset;

DROP TABLE Prize;

DROP TABLE Roster;

DROP TABLE Suspension;

DROP TABLE Team;

DROP TABLE TiebreakerRule;

DROP TABLE Tournament;

DROP TABLE TournamentAdmin;

DROP TABLE "User";

-- End of file.


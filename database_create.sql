-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2021-09-01 17:09:03.117

-- tables
-- Table: ActiveRoster
CREATE TABLE ActiveRoster (
    PlayerId int  NOT NULL,
    RosterId int  NOT NULL,
    CONSTRAINT ActiveRoster_pk PRIMARY KEY (PlayerId,RosterId)
);

-- Table: Game
CREATE TABLE Game (
    GameId int  NOT NULL,
    Name varchar(255)  NOT NULL,
    CONSTRAINT Game_pk PRIMARY KEY (GameId)
);

-- Table: Group
CREATE TABLE "Group" (
    GroupId int  NOT NULL,
    NumberOfTeams int  NOT NULL,
    NumberOfQualifying int  NOT NULL,
    TournamentId int  NOT NULL,
    CONSTRAINT Group_pk PRIMARY KEY (GroupId)
);

-- Table: GroupRule
CREATE TABLE GroupRule (
    RulePriority int  NOT NULL,
    TiebreakerRuleId int  NOT NULL,
    GroupId int  NOT NULL,
    CONSTRAINT GroupRule_pk PRIMARY KEY (TiebreakerRuleId,GroupId)
);

-- Table: GroupStanding
CREATE TABLE GroupStanding (
    GroupStandingIdId int  NOT NULL,
    Points int  NOT NULL,
    Place int  NOT NULL,
    GroupId int  NOT NULL,
    RosterId int  NOT NULL,
    CONSTRAINT GroupStanding_pk PRIMARY KEY (GroupStandingIdId)
);

-- Table: Ladder
CREATE TABLE Ladder (
    LadderId int  NOT NULL,
    TournamentId int  NOT NULL,
    CONSTRAINT Ladder_pk PRIMARY KEY (LadderId)
);

-- Table: LadderStanding
CREATE TABLE LadderStanding (
    LadderStandingId int  NOT NULL,
    Stage varchar(50)  NOT NULL,
    RosterId int  NOT NULL,
    LadderId int  NOT NULL,
    CONSTRAINT LadderStanding_pk PRIMARY KEY (LadderStandingId)
);

-- Table: Map
CREATE TABLE Map (
    MapId int  NOT NULL,
    MapResult varchar(10)  NOT NULL,
    MatchId int  NOT NULL,
    CONSTRAINT Map_pk PRIMARY KEY (MapId)
);

-- Table: Match
CREATE TABLE Match (
    MatchId int  NOT NULL,
    MatchStartDate date  NULL,
    MatchEndDate date  NULL,
    TournamentStage varchar(30)  NULL,
    MatchResult varchar(10)  NULL,
    TournamentId int  NOT NULL,
    RosterId int  NOT NULL,
    Roster2Id int  NOT NULL,
    CONSTRAINT Match_pk PRIMARY KEY (MatchId)
);

-- Table: Performance
CREATE TABLE Performance (
    PerformanceId int  NOT NULL,
    Kills int  NOT NULL,
    Deaths int  NOT NULL,
    Assists int  NOT NULL,
    PlayerId int  NOT NULL,
    MapId int  NOT NULL,
    CONSTRAINT Performance_pk PRIMARY KEY (PerformanceId)
);

-- Table: Player
CREATE TABLE Player (
    PlayerId int  NOT NULL,
    PUUID varchar(78)  NOT NULL,
    AccountId varchar(100)  NOT NULL,
    SummonerId varchar(100)  NOT NULL,
    Region varchar(10)  NOT NULL,
    UserId int  NOT NULL,
    GameId int  NOT NULL,
    TeamId int  NOT NULL,
    CONSTRAINT Player_pk PRIMARY KEY (PlayerId)
);

-- Table: Preset
CREATE TABLE Preset (
    PresetId int  NOT NULL,
    Map varchar(30)  NOT NULL,
    PickRules varchar(30)  NOT NULL,
    SpectatorRules varchar(30)  NOT NULL,
    CONSTRAINT Preset_pk PRIMARY KEY (PresetId)
);

-- Table: Prize
CREATE TABLE Prize (
    PrizeId int  NOT NULL,
    Currency varchar(20)  NULL,
    Disctribution varchar(255)  NOT NULL,
    CONSTRAINT Prize_pk PRIMARY KEY (PrizeId)
);

-- Table: Roster
CREATE TABLE Roster (
    RosterId int  NOT NULL,
    SignDate date  NOT NULL,
    IsRegistered boolean  NOT NULL,
    TeamId int  NOT NULL,
    CONSTRAINT Roster_pk PRIMARY KEY (RosterId)
);

-- Table: Suspension
CREATE TABLE Suspension (
    SuspensionId int  NOT NULL,
    StartDate date  NULL,
    EndDate date  NULL,
    UserId int  NOT NULL,
    CONSTRAINT Suspension_pk PRIMARY KEY (SuspensionId)
);

-- Table: Team
CREATE TABLE Team (
    TeamId int  NOT NULL,
    Name varchar(50)  NOT NULL,
    CreationDate date  NOT NULL,
    CaptainId int  NOT NULL,
    CONSTRAINT Team_pk PRIMARY KEY (TeamId)
);

-- Table: TiebreakerRule
CREATE TABLE TiebreakerRule (
    TiebreakerRuleId int  NOT NULL,
    Rule varchar(255)  NOT NULL,
    CONSTRAINT TiebreakerRule_pk PRIMARY KEY (TiebreakerRuleId)
);

-- Table: Tournament
CREATE TABLE Tournament (
    TournamentId int  NOT NULL,
    Name varchar(255)  NOT NULL,
    NumberOfPlayers int  NOT NULL,
    NumberOfTeams int  NOT NULL,
    RegisterStartDate date  NOT NULL,
    RegisterEndDate date  NULL,
    TournamentStartDate date  NOT NULL,
    TournamentEndDate date  NULL,
    Description text  NULL,
    PresetId int  NOT NULL,
    PrizeId int  NOT NULL,
    GameId int  NOT NULL,
    OrganizerId int  NOT NULL,
    CONSTRAINT Tournament_pk PRIMARY KEY (TournamentId)
);

-- Table: TournamentAdmin
CREATE TABLE TournamentAdmin (
    TournamentId int  NOT NULL,
    UserId int  NOT NULL,
    CONSTRAINT TournamentAdmin_pk PRIMARY KEY (TournamentId,UserId)
);

-- Table: User
CREATE TABLE "User" (
    UserId int  NOT NULL,
    Username varchar(30)  NOT NULL,
    Email varchar(255)  NOT NULL,
    Password varchar(255)  NOT NULL,
    Country varchar(30)  NOT NULL,
    University varchar(80)  NULL,
    StudentId varchar(10)  NULL,
    CONSTRAINT User_pk PRIMARY KEY (UserId)
);

-- foreign keys
-- Reference: ActiveRoster_Player (table: ActiveRoster)
ALTER TABLE ActiveRoster ADD CONSTRAINT ActiveRoster_Player
    FOREIGN KEY (PlayerId)
    REFERENCES Player (PlayerId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: ActiveRoster_Roster (table: ActiveRoster)
ALTER TABLE ActiveRoster ADD CONSTRAINT ActiveRoster_Roster
    FOREIGN KEY (RosterId)
    REFERENCES Roster (RosterId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: GroupRule_Group (table: GroupRule)
ALTER TABLE GroupRule ADD CONSTRAINT GroupRule_Group
    FOREIGN KEY (GroupId)
    REFERENCES "Group" (GroupId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: GroupRule_TiebreakerRule (table: GroupRule)
ALTER TABLE GroupRule ADD CONSTRAINT GroupRule_TiebreakerRule
    FOREIGN KEY (TiebreakerRuleId)
    REFERENCES TiebreakerRule (TiebreakerRuleId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: GroupStanding_Group (table: GroupStanding)
ALTER TABLE GroupStanding ADD CONSTRAINT GroupStanding_Group
    FOREIGN KEY (GroupId)
    REFERENCES "Group" (GroupId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: GroupStanding_Roster (table: GroupStanding)
ALTER TABLE GroupStanding ADD CONSTRAINT GroupStanding_Roster
    FOREIGN KEY (RosterId)
    REFERENCES Roster (RosterId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Group_Tournament (table: Group)
ALTER TABLE "Group" ADD CONSTRAINT Group_Tournament
    FOREIGN KEY (TournamentId)
    REFERENCES Tournament (TournamentId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: LadderStanding_Ladder (table: LadderStanding)
ALTER TABLE LadderStanding ADD CONSTRAINT LadderStanding_Ladder
    FOREIGN KEY (LadderId)
    REFERENCES Ladder (LadderId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: LadderStanding_Roster (table: LadderStanding)
ALTER TABLE LadderStanding ADD CONSTRAINT LadderStanding_Roster
    FOREIGN KEY (RosterId)
    REFERENCES Roster (RosterId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Ladder_Tournament (table: Ladder)
ALTER TABLE Ladder ADD CONSTRAINT Ladder_Tournament
    FOREIGN KEY (TournamentId)
    REFERENCES Tournament (TournamentId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Map_Match (table: Map)
ALTER TABLE Map ADD CONSTRAINT Map_Match
    FOREIGN KEY (MatchId)
    REFERENCES Match (MatchId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Match_Roster (table: Match)
ALTER TABLE Match ADD CONSTRAINT Match_Roster
    FOREIGN KEY (RosterId)
    REFERENCES Roster (RosterId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Match_Roster2 (table: Match)
ALTER TABLE Match ADD CONSTRAINT Match_Roster2
    FOREIGN KEY (Roster2Id)
    REFERENCES Roster (RosterId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Match_Tournament (table: Match)
ALTER TABLE Match ADD CONSTRAINT Match_Tournament
    FOREIGN KEY (TournamentId)
    REFERENCES Tournament (TournamentId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Performance_Map (table: Performance)
ALTER TABLE Performance ADD CONSTRAINT Performance_Map
    FOREIGN KEY (MapId)
    REFERENCES Map (MapId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Performance_Player (table: Performance)
ALTER TABLE Performance ADD CONSTRAINT Performance_Player
    FOREIGN KEY (PlayerId)
    REFERENCES Player (PlayerId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Player_Game (table: Player)
ALTER TABLE Player ADD CONSTRAINT Player_Game
    FOREIGN KEY (GameId)
    REFERENCES Game (GameId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Player_Team (table: Player)
ALTER TABLE Player ADD CONSTRAINT Player_Team
    FOREIGN KEY (TeamId)
    REFERENCES Team (TeamId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Player_User (table: Player)
ALTER TABLE Player ADD CONSTRAINT Player_User
    FOREIGN KEY (UserId)
    REFERENCES "User" (UserId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Roster_Team (table: Roster)
ALTER TABLE Roster ADD CONSTRAINT Roster_Team
    FOREIGN KEY (TeamId)
    REFERENCES Team (TeamId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Suspension_User (table: Suspension)
ALTER TABLE Suspension ADD CONSTRAINT Suspension_User
    FOREIGN KEY (UserId)
    REFERENCES "User" (UserId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Team_Player (table: Team)
ALTER TABLE Team ADD CONSTRAINT Team_Player
    FOREIGN KEY (CaptainId)
    REFERENCES Player (PlayerId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: TournamentAdmin_Tournament (table: TournamentAdmin)
ALTER TABLE TournamentAdmin ADD CONSTRAINT TournamentAdmin_Tournament
    FOREIGN KEY (TournamentId)
    REFERENCES Tournament (TournamentId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: TournamentAdmin_User (table: TournamentAdmin)
ALTER TABLE TournamentAdmin ADD CONSTRAINT TournamentAdmin_User
    FOREIGN KEY (UserId)
    REFERENCES "User" (UserId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Tournament_Game (table: Tournament)
ALTER TABLE Tournament ADD CONSTRAINT Tournament_Game
    FOREIGN KEY (GameId)
    REFERENCES Game (GameId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Tournament_Preset (table: Tournament)
ALTER TABLE Tournament ADD CONSTRAINT Tournament_Preset
    FOREIGN KEY (PresetId)
    REFERENCES Preset (PresetId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Tournament_Prize (table: Tournament)
ALTER TABLE Tournament ADD CONSTRAINT Tournament_Prize
    FOREIGN KEY (PrizeId)
    REFERENCES Prize (PrizeId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Tournament_User (table: Tournament)
ALTER TABLE Tournament ADD CONSTRAINT Tournament_User
    FOREIGN KEY (OrganizerId)
    REFERENCES "User" (UserId)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- End of file.


CREATE TABLE Session_Utilisateur (
    ID_Session VARCHAR(36) PRIMARY KEY,
    ID_Utilisateur VARCHAR(36) NOT NULL,
    Token_Session VARCHAR(500) UNIQUE NOT NULL,
    IP_Address VARCHAR(45),
    User_Agent VARCHAR(500),
    Date_Debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Date_Expiration TIMESTAMP NOT NULL,
    Est_Actif BOOLEAN DEFAULT TRUE
);

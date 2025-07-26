-- for books

INSERT INTO BOOKS (BOOK_ID, BOOK_NAME, AUTHOR, GENRE, TOTAL_COPIES, AVAILABLE_COPIES)
VALUES
-- Existing books
(1, 'TO KILL A MOCKINGBIRD', 'HARPER LEE', 'FICTION', 5, 3),
(2, '1984', 'GEORGE ORWELL', 'DYSTOPIAN', 4, 0),
(3, 'THE GREAT GATSBY', 'F. SCOTT FITZGERALD', 'CLASSIC', 6, 6),
(4, 'SAPIENS', 'YUVAL NOAH HARARI', 'HISTORY', 3, 1),
(5, 'THE ALCHEMIST', 'PAULO COELHO', 'FICTION', 5, 2),
(6, 'INTRODUCTION TO ALGORITHMS', 'CORMEN', 'COMPUTER SCIENCE', 2, 0),

-- Mangas
(7, 'DEATH NOTE VOL. 1', 'TSUGUMI OHBA', 'MANGA', 4, 1),
(8, 'NARUTO VOL. 1', 'MASASHI KISHIMOTO', 'MANGA', 5, 3),
(9, 'ATTACK ON TITAN VOL. 1', 'HAJIME ISAYAMA', 'MANGA', 3, 0),
(10, 'DEMON SLAYER VOL. 1', 'KOYOHARU GOTOUGE', 'MANGA', 4, 2),

-- Manhwa
(11, 'SOLO LEVELING VOL. 1', 'CHUGONG', 'MANHWA', 3, 1),
(12, 'TOWER OF GOD VOL. 1', 'SIU', 'MANHWA', 4, 3),
(13, 'WIND BREAKER', 'YOUNGSEOK JO', 'MANHWA', 3, 1),
(14, 'REMARRIED EMPRESS', 'ALPHATART', 'MANHWA', 4, 3),

-- Comics
(15, 'SPIDER-MAN: HOMECOMING', 'STAN LEE', 'COMIC', 5, 4),
(16, 'BATMAN: YEAR ONE', 'FRANK MILLER', 'COMIC', 2, 1),
(17, 'AVENGERS: INFINITY WAR', 'JIM STARLIN', 'COMIC', 3, 0),

-- Student Books
(18, 'ENGINEERING MATHEMATICS', 'B.S. GREWAL', 'STUDENT TEXTBOOK', 6, 5),
(19, 'PHYSICS FOR CLASS 12', 'H.C. VERMA', 'STUDENT TEXTBOOK', 4, 2),
(20, 'CHEMISTRY PART 1', 'NCERT', 'STUDENT TEXTBOOK', 3, 1),
(21, 'INTRO TO DATABASE SYSTEMS', 'C.J. DATE', 'STUDENT TEXTBOOK', 3, 2),
(22, 'OBJECT ORIENTED PROGRAMMING', 'BALAGURUSAMY', 'STUDENT TEXTBOOK', 5, 3);

-- For staff

INSERT INTO STAFF (STAFF_ID, STAFF_NAME, STAFF_EMAIL, STATUS, START_DATE, END_DATE, DESIGNATION, EMP_TYPE)
VALUES
(1, 'Srishti Turki', 'srishtiturki@library.com', 'Active', '2021-06-15', NULL, 'Chief Librarian', 'Permanent'),
(2, 'Pip', 'pip@library.com', 'Active', '2022-01-10', NULL, 'Librarian Assistant', 'Permanent'),
(3, 'Ravi Singh', 'ilovesarge@library.com', 'Inactive', '2020-04-01', '2023-03-31', 'Senior Librarian', 'Contract'),
(4, 'Levi Ackerman', 'ackerman@library.com', 'Active', '2023-07-01', NULL, 'Technical Support', 'Temporary'),
(5, 'Haebom', 'haebom@library.com', 'Active', '2024-02-20', NULL, 'Catalog Manager', 'Permanent'),
(6, 'Wei Wuxian', 'demoniccultivator@library.com', 'On Leave', '2021-11-05', NULL, 'Event Coordinator', 'Permanent'),
(7, 'Lan Wangji', 'lanofgusuclan@library.com', 'Active', '2023-09-12', NULL, 'Assistant Librarian', 'Temporary'),
(8, 'Taesung', 'ilovehaebom@library.com', 'Inactive', '2019-08-10', '2022-12-31', 'Book Restorer', 'Contract');

-- for members

INSERT INTO MEMBERS (MEMBER_ID, MEMBER_NAME, MEMBER_EMAIL, MEMBER_TYPE, START_DATE, END_DATE)
VALUES
('M001', 'Nana', 'nana@studentmail.com', 'MEMBER', '2023-01-10', NULL),
('N001', 'Hachi', 'neenana@gmail.com', 'NON_MEMBER', NULL, NULL),
('M002', 'HyunJu', 'hyunju@alumni.edu', 'MEMBER', '2022-07-15', '2024-07-14'),
('M003', 'Kenji Kishimoto', 'kingkenji@libraryuser.org', 'MEMBER', '2024-02-01', NULL),
('N002', 'Mizi', 'mizi@gmail.com', 'NON_MEMBER', NULL, NULL),
('M004', 'Sua', 'sua@studentportal.com', 'MEMBER', '2023-08-20', NULL),
('M005', 'Till', 'till@email.com', 'MEMBER', '2022-12-05', '2023-12-05'),
('N003', 'Ivan', 'ivan@guestmail.com', 'NON_MEMBER', NULL, NULL),
('N004', 'Sky', 'wongrawee@guestmail.com', 'NON_MEMBER', NULL, NULL),
('N005', 'Nani', 'iminaskynani@guestmail.com', 'NON_MEMBER', NULL, NULL),
('M005', 'First', 'khaolove@studentportal.com', 'MEMBER', '2023-08-20', NULL),
('M006', 'Khao', 'Khao@studentportal.com', 'MEMBER', '2023-08-20', NULL);

-- for borrow
-- For MEMBERS
CALL insert_borrowing('M001', 1, '2024-05-01', '2024-05-15', '2024-05-14');
CALL insert_borrowing('M002', 2, '2024-05-03', '2024-05-17', '2024-06-20');
CALL insert_borrowing('M003', 3, '2024-06-01', '2024-06-15', NULL);
CALL insert_borrowing('M004', 4, '2024-06-05', '2024-06-20', NULL);
CALL insert_borrowing('M005', 5, '2023-11-01', '2023-11-15', '2023-11-12');
CALL insert_borrowing('M006', 4, '2024-06-05', '2024-07-20', NULL);
CALL insert_borrowing('M007', 5, '2023-11-01', '2023-12-15', '2023-11-12');

-- For NON-MEMBERS0
CALL insert_borrowing('N001', 6, '2024-05-10', '2024-05-20', '2024-05-25');
CALL insert_borrowing('N002', 7, '2024-05-11', '2024-05-21', '2024-06-20');
CALL insert_borrowing('N003', 2, '2024-06-01', '2024-06-10', NULL);
CALL insert_borrowing('N004', 4, '2024-05-15', '2024-05-30', '2024-05-29');
CALL insert_borrowing('N005', 10, '2024-06-01', '2024-06-10', NULL);


/* INSERT INTO FINE (BORROW_ID, MEMBER_ID, FINE_IMPOSED, PAID, DAYS_OVERDUE)
VALUES
    ('24050002', 'M002', 30, FALSE, 3),
    ('24050006', 'N001', 150, FALSE, 5),
    ('24060003', 'M003', 3620, FALSE, 362),
    ('24060004', 'M004', 3560, FALSE, 356),
    ('24060008', 'N003', 10980, FALSE, 366),
    ('24060010', 'N005', 10980, FALSE, 366); */

--
INSERT INTO MEMBER_ID_HISTORY (EMAIL, OLD_MEMBER_ID, TYPE)
VALUES
('hyunju@alumni.edu', 'M002', 'MEMBER'),
('till@email.com', 'M005', 'MEMBER'),
('ivan@guestmail.com', 'N003', 'NON_MEMBER'),
('wongrawee@guestmail.com', 'N004', 'NON_MEMBER'),
('iminaskynani@guestmail.com', 'N005', 'NON_MEMBER');

--
INSERT INTO LOGIN_LOG (username, login_time)
VALUES
('nana', '2025-06-10 08:45:00'),
('hyunju', '2025-06-10 09:10:00'),
('mizi', '2025-06-10 10:00:00'),
('kenji', '2025-06-11 08:00:00'),
('sua', '2025-06-11 08:30:00');
--

-- Manually simulate logs (optional)
INSERT INTO SYSTEM_LOG (log_message, log_time)
VALUES
('User nana has logged in.', '2025-06-10 08:45:00'),
('User hyunju has logged in.', '2025-06-10 09:10:00');
--
INSERT INTO RENEWAL_CHOICES (MEMBER_ID, MEMBER_TYPE, EMAIL, WANTS_RENEWAL, RESPONSE_DATE, MONEY_PAID)
VALUES
-- Members
('M001', 'MEMBER', 'nana@studentmail.com', TRUE, '2025-05-01', 500),
('M002', 'MEMBER', 'hyunju@alumni.edu', FALSE, '2025-04-10', 0),
('M003', 'MEMBER', 'kingkenji@libraryuser.org', TRUE, '2025-06-01', 500),
('M004', 'MEMBER', 'sua@studentportal.com', TRUE, '2025-06-05', 500),
('M005', 'MEMBER', 'till@email.com', FALSE, '2023-11-30', 0),

-- Non-Members
('N001', 'NON_MEMBER', 'neenana@gmail.com', FALSE, '2025-05-20', 0),
('N002', 'NON_MEMBER', 'mizi@gmail.com', TRUE, '2025-06-01', 200),
('N003', 'NON_MEMBER', 'ivan@guestmail.com', FALSE, '2025-05-25', 0),
('N004', 'NON_MEMBER', 'wongrawee@guestmail.com', TRUE, '2025-06-10', 300),
('N005', 'NON_MEMBER', 'iminaskynani@guestmail.com', TRUE, '2025-06-05', 200);







/* Triggers */

DELIMITER $$

CREATE TRIGGER trigger_fine_on_return
AFTER UPDATE ON BORROWING
FOR EACH ROW
BEGIN
    DECLARE days_late INT;
    DECLARE fine_rate INT;
    DECLARE fine_amount INT;

    IF NEW.RETURN_DATE IS NOT NULL AND NEW.RETURN_DATE > NEW.DUE_DATE THEN
        SET days_late = DATEDIFF(NEW.RETURN_DATE, NEW.DUE_DATE);

        IF NEW.MEMBER_ID LIKE 'M%' THEN
            SET fine_rate = 2;
        ELSE
            SET fine_rate = 5;
        END IF;

        SET fine_amount = days_late * fine_rate;

        INSERT INTO FINE (MEMBER_ID, BORROW_ID, FINE_IMPOSED, PAID, DAYS_OVERDUE)
        VALUES (NEW.MEMBER_ID, NEW.BORROW_ID, fine_amount, FALSE, days_late);
    END IF;
END$$

DELIMITER ;

-- end 

DELIMITER $$

CREATE EVENT daily_membership_check
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    UPDATE MEMBERS
    SET MEMBER_TYPE = 'NON_MEMBER'
    WHERE END_DATE < CURDATE();
END$$

DELIMITER ;
-- 

DELIMITER $$

CREATE TRIGGER trigger_update_member_id
BEFORE UPDATE ON MEMBERS
FOR EACH ROW
BEGIN
    DECLARE new_id VARCHAR(50);
    DECLARE last_id_num INT;
    DECLARE reused_id VARCHAR(50);

    -- CHANGING FROM MEMBER → NON_MEMBER
    IF NEW.MEMBER_TYPE = 'NON_MEMBER' AND OLD.MEMBER_TYPE = 'MEMBER' THEN

        SELECT OLD_MEMBER_ID INTO reused_id
        FROM MEMBER_ID_HISTORY
        WHERE EMAIL = OLD.MEMBER_EMAIL AND TYPE = 'NON_MEMBER'
        LIMIT 1;

        IF reused_id IS NOT NULL THEN
            SET new_id = reused_id;
        ELSE
            SELECT MAX(CAST(SUBSTRING(MEMBER_ID, 3) AS UNSIGNED))
            INTO last_id_num
            FROM MEMBERS
            WHERE MEMBER_ID LIKE 'N_%';

            SET new_id = CONCAT('N_', last_id_num + 1);
        END IF;

        INSERT INTO MEMBER_ID_HISTORY VALUES (OLD.MEMBER_EMAIL, OLD.MEMBER_ID, 'MEMBER');

        SET NEW.MEMBER_ID = new_id;

    ELSEIF NEW.MEMBER_TYPE = 'MEMBER' AND OLD.MEMBER_TYPE = 'NON_MEMBER' THEN

        SELECT OLD_MEMBER_ID INTO reused_id
        FROM MEMBER_ID_HISTORY
        WHERE EMAIL = OLD.MEMBER_EMAIL AND TYPE = 'MEMBER'
        LIMIT 1;

        IF reused_id IS NOT NULL THEN
            SET new_id = reused_id;
        ELSE
            SELECT MAX(CAST(SUBSTRING(MEMBER_ID, 3) AS UNSIGNED))
            INTO last_id_num
            FROM MEMBERS
            WHERE MEMBER_ID LIKE 'M_%';

            SET new_id = CONCAT('M_', last_id_num + 1);
        END IF;

        INSERT INTO MEMBER_ID_HISTORY VALUES (OLD.MEMBER_EMAIL, OLD.MEMBER_ID, 'NON_MEMBER');

        SET NEW.MEMBER_ID = new_id;
    END IF;
END$$

DELIMITER ;
--

DELIMITER $$

CREATE TABLE login_log (
  username VARCHAR(100),
  login_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  log_message TEXT,
  log_time DATETIME
);

DELIMITER ;
--

DELIMITER $$

CREATE TRIGGER trigger_generate_member_id
BEFORE INSERT ON MEMBERS
FOR EACH ROW
BEGIN
    DECLARE NEW_ID INT DEFAULT 0;
    DECLARE PREFIX VARCHAR(1);

    -- Determine prefix based on MEMBER_TYPE
    SET PREFIX = CASE 
        WHEN NEW.MEMBER_TYPE = 'MEMBER' THEN 'M'
        WHEN NEW.MEMBER_TYPE = 'NON_MEMBER' THEN 'N'
        ELSE 'X'
    END;

    -- Generate ID only if MEMBER_TYPE is 'MEMBER' or 'NON_MEMBER'
    IF PREFIX IN ('M', 'N') THEN
        SELECT MAX(CAST(SUBSTRING(MEMBER_ID, 2) AS UNSIGNED))
        INTO NEW_ID
        FROM MEMBERS
        WHERE MEMBER_ID LIKE CONCAT(PREFIX, '%');

        IF NEW_ID IS NULL THEN
            SET NEW_ID = 1;
        ELSE
            SET NEW_ID = NEW_ID + 1;
        END IF;

        SET NEW.MEMBER_ID = CONCAT(PREFIX, LPAD(NEW_ID, 3, '0'));
    ELSE
        SET NEW.MEMBER_ID = NULL; -- or raise an error if invalid
    END IF;
END$$

DELIMITER ;
--
DELIMITER $$

CREATE PROCEDURE insert_borrowing(
    IN p_member_id VARCHAR(10),
    IN p_book_id INT,
    IN p_borrow_date DATE,
    IN p_due_date DATE,
    IN p_return_date DATE
)
BEGIN
    DECLARE v_prefix INT;
    DECLARE v_serial INT;
    DECLARE v_new_id INT;

    -- Build prefix from year and month
    SET v_prefix = DATE_FORMAT(p_borrow_date, '%y%m');  -- YYMM

    -- Get the next serial for this prefix
    SELECT IFNULL(MAX(BORROW_ID) % 10000, 0) + 1
    INTO v_serial
    FROM BORROWING
    WHERE FLOOR(BORROW_ID / 10000) = v_prefix;

    -- Construct new BORROW_ID
    SET v_new_id = v_prefix * 10000 + v_serial;

    -- Insert into table
    INSERT INTO BORROWING (BORROW_ID, MEMBER_ID, BOOK_ID, BORROW_DATE, DUE_DATE, RETURN_DATE)
    VALUES (v_new_id, p_member_id, p_book_id, p_borrow_date, p_due_date, p_return_date);
END $$

DELIMITER ;

--

DELIMITER $$

CREATE TRIGGER trg_generate_fine
AFTER INSERT ON BORROWING
FOR EACH ROW
BEGIN
    DECLARE overdue_days INT DEFAULT 0;
    DECLARE fine_amount DECIMAL(10,2) DEFAULT 0;

    IF NEW.RETURN_DATE IS NOT NULL AND NEW.RETURN_DATE > NEW.DUE_DATE THEN
        SET overdue_days = DATEDIFF(NEW.RETURN_DATE, NEW.DUE_DATE);
        
        IF LEFT(NEW.MEMBER_ID, 1) = 'M' THEN
            SET fine_amount = overdue_days * 10;
        ELSE
            SET fine_amount = overdue_days * 30;
        END IF;

        INSERT INTO FINE (BORROW_ID, MEMBER_ID, FINE_IMPOSED, PAID, DAYS_OVERDUE)
        VALUES (NEW.BORROW_ID, NEW.MEMBER_ID, fine_amount, FALSE, overdue_days);
    END IF;
END$$

DELIMITER ;

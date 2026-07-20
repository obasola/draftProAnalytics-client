DELIMITER $$

DROP TRIGGER IF EXISTS `trg_TeamNeed_before_insert`$$

CREATE TRIGGER `trg_TeamNeed_before_insert`
BEFORE INSERT ON `TeamNeed`
FOR EACH ROW
BEGIN
    IF NEW.`createdAt` IS NULL THEN
        SET NEW.`createdAt` = CURRENT_TIMESTAMP;
    END IF;

    IF NEW.`updatedAt` IS NULL THEN
        SET NEW.`updatedAt` = CURRENT_TIMESTAMP;
    END IF;
END$$


DROP TRIGGER IF EXISTS `trg_TeamNeed_before_update`$$

CREATE TRIGGER `trg_TeamNeed_before_update`
BEFORE UPDATE ON `TeamNeed`
FOR EACH ROW
BEGIN
    SET NEW.`updatedAt` = CURRENT_TIMESTAMP;

    IF NEW.`createdAt` IS NULL THEN
        SET NEW.`createdAt` = OLD.`createdAt`;
    END IF;
END$$

DELIMITER ;

<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration,
    Doctrine\DBAL\Schema\Schema;

/**
 * Creating the institutions(used for universities) table.
 */
class Version20130209230201 extends AbstractMigration
{
    public function up(Schema $schema)
    {
         // Create table institutions    
        $this->addSql("CREATE  TABLE IF NOT EXISTS `institutions` (
                      `id` INT NOT NULL AUTO_INCREMENT ,
                      `name` VARCHAR(255) NOT NULL ,
                      `url` text,
                       `slug` VARCHAR(255) NOT NULL,
                       `is_university` BOOLEAN NOT NULL DEFAULT 1,
                      PRIMARY KEY (`id`)  )              
                      ENGINE = InnoDB;");
        
        // Create a unique index on slug
        $this->addSql("CREATE UNIQUE INDEX `institutions.slug` ON institutions(slug) ");
        
        // Create a join table with courses
        $this->addSql("
                CREATE TABLE IF NOT EXISTS courses_institutions(
                `id` INT NOT NULL AUTO_INCREMENT ,
                `course_id` INT NOT NULL ,
                `institution_id` INT NOT NULL ,
                PRIMARY KEY (`id`) ,
                INDEX `courses_institutions.course_id` (`course_id` ASC) ,
                INDEX `courses_institutions.institution_id` (`institution_id` ASC) ,
                CONSTRAINT `courses_institutions.course_id`
                  FOREIGN KEY (`course_id` )
                  REFERENCES `courses` (`id` )
                  ON DELETE NO ACTION
                  ON UPDATE NO ACTION,
                CONSTRAINT `courses_institutions.institution_id`
                  FOREIGN KEY (`institution_id` )
                  REFERENCES `institutions` (`id` )
                  ON DELETE NO ACTION
                  ON UPDATE NO ACTION)
                 ENGINE = InnoDB
        ");
        
    }

    public function down(Schema $schema)
    {
        // this down() migration is autogenerated, please modify it to your needs

    }
}

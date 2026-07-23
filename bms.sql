-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: bms
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `backups`
--

DROP TABLE IF EXISTS `backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instance_id` int DEFAULT NULL,
  `backup_date` datetime DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `backup_size` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `remarks` text,
  `backup_location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`),
  CONSTRAINT `backups_ibfk_1` FOREIGN KEY (`instance_id`) REFERENCES `instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backups`
--

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
INSERT INTO `backups` VALUES (1,1,'2026-06-19 17:41:16','15 Minutes','2.5 GB','Success',NULL,'D:/backups/oracle_prod.bkp'),(2,2,'2026-06-21 17:15:22','18 Minutes','5.8 GB','Success',NULL,'D:/mysql_backups/mysql_prod.bkp'),(3,3,'2026-06-21 17:15:22','10 Minutes','1.2 GB','Success',NULL,'D:/oracle_test_backups/oracle_test.bkp'),(4,3,'2026-06-21 18:54:23','25s','108.5 GB','Success',NULL,'D:/DatabaseBackup/ICARD/'),(5,NULL,'2026-06-21 19:08:49','25s','108.5 GB','Success',NULL,'F:/UTS_Backup_Share/'),(6,1,'2026-06-21 19:09:39','05s','12.8 GB','Success',NULL,'/mnt/nfs/ticketing_prod/'),(7,NULL,'2026-06-22 04:44:15','05s','12.8 GB','Success',NULL,'/var/backups/coa/'),(8,NULL,'2026-06-22 04:46:00','25s','108.5 GB','Success',NULL,'E:/Backups/FOIS/'),(9,NULL,'2026-06-22 09:49:33','25s','108.5 GB','Success',NULL,'F:/UTS_Backup_Share/'),(10,NULL,'2026-06-22 10:10:09','25s','108.5 GB','Success',NULL,'F:/UTS_Backup_Share/'),(11,NULL,'2026-06-22 10:12:13','25s','108.5 GB','Success',NULL,'E:/Backups/FOIS/'),(12,3,'2026-06-22 11:31:17','25s','108.5 GB','Success',NULL,'D:/DatabaseBackup/ICARD/'),(13,NULL,'2026-06-22 11:32:11','05s','12.8 GB','Success',NULL,'/var/backups/coa/'),(14,3,'2026-06-23 12:31:32','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782198092022.sql'),(15,1,'2026-06-23 07:08:17','05s','12.8 GB','Success',NULL,'/mnt/nfs/ticketing_prod/'),(16,3,'2026-06-23 12:46:57','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782199016909.sql'),(17,3,'2026-06-24 17:03:39','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782300818961.sql'),(18,3,'2026-06-24 22:56:25','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782321984890.dump'),(19,2,'2026-06-25 00:36:03','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782327963475.dump'),(20,2,'2026-06-25 00:45:35','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782328535335.dump'),(21,2,'2026-06-27 12:55:07','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782545106920.dump'),(22,2,'2026-06-28 11:35:42','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782626741916.dump');
/*!40000 ALTER TABLE `backups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instances`
--

DROP TABLE IF EXISTS `instances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `ip` varchar(50) NOT NULL,
  `db_type` varchar(20) DEFAULT NULL,
  `port` int DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `backup_location` varchar(255) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `db_name` varchar(100) DEFAULT NULL,
  `db_password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instances`
--

LOCK TABLES `instances` WRITE;
/*!40000 ALTER TABLE `instances` DISABLE KEYS */;
INSERT INTO `instances` VALUES (1,'Oracle PROD','192.168.1.10','Oracle',1521,'Connected','D:/backups','admin','Production Database','2026-06-19 05:13:14',NULL,'your_password'),(2,'MySQL PROD','localhost','MySQL',3306,'Connected','D:/mysql_backups','root','Production MySQL','2026-06-19 08:26:09','bms','your_password'),(3,'Oracle TEST','192.168.1.100','Oracle',1521,'Connected','D:/DatabaseBackup/OracleTEST/','admin','Newly registered node. Telemetry operational.','2026-06-19 08:44:23',NULL,'your_password'),(4,'Oracle DEV','192.168.1.100','Oracle',1521,'Connected','D:/DatabaseBackup/OracleDEV/','admin','Newly registered node. Telemetry operational.','2026-06-21 19:07:21',NULL,'your_password'),(5,'Backup-Test-DB','localhost','MySQL',3306,'Connected','D:/DatabaseBackup/Backup-Test-DB/','admin','Newly registered node. Telemetry operational.','2026-06-22 09:59:51','bms','your_password'),(6,'Backup-Test-Ds','127.0.0.1','Oracle',1521,'Connected','D:/DatabaseBackup/Backup-Test-Ds/','admin','Newly registered node. Telemetry operational.','2026-06-22 11:30:09',NULL,'your_password');
/*!40000 ALTER TABLE `instances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `message` text,
  `type` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@gmail.com','123456');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-29 22:15:07

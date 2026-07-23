-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: backup_monitoring
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
-- Table structure for table `backup_schedules`
--

DROP TABLE IF EXISTS `backup_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instance_id` int NOT NULL,
  `frequency` varchar(20) NOT NULL DEFAULT 'Daily',
  `backup_time` time NOT NULL DEFAULT '02:00:00',
  `start_date` date NOT NULL,
  `storage_destination` varchar(50) DEFAULT 'Local Drive',
  `backup_path` varchar(255) DEFAULT NULL,
  `retention_policy` varchar(20) DEFAULT '30 Days',
  `email_alert` tinyint(1) DEFAULT '1',
  `sms_alert` tinyint(1) DEFAULT '1',
  `status` varchar(20) DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_sched_instance` (`instance_id`),
  CONSTRAINT `fk_sched_instance` FOREIGN KEY (`instance_id`) REFERENCES `instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_schedules`
--

LOCK TABLES `backup_schedules` WRITE;
/*!40000 ALTER TABLE `backup_schedules` DISABLE KEYS */;
INSERT INTO `backup_schedules` VALUES (1,2,'Daily','02:00:00','2026-07-04','Local Drive',NULL,'30 Days',1,1,'Paused','2026-07-04 07:22:56'),(2,7,'Weekly','12:56:00','2026-07-04','Local Drive',NULL,'30 Days',1,1,'Paused','2026-07-04 07:25:04'),(3,6,'Daily','13:05:00','2026-07-04','Local Drive',NULL,'30 Days',1,1,'Paused','2026-07-04 07:33:47'),(4,8,'Daily','13:09:00','2026-07-04','Local Drive',NULL,'30 Days',1,1,'Paused','2026-07-04 07:37:20'),(5,10,'Daily','13:14:00','2026-07-04','Local Drive',NULL,'30 Days',1,1,'Active','2026-07-04 07:43:29'),(6,11,'Daily','13:21:00','2026-07-04','Local Drive',NULL,'30 Days',1,1,'Paused','2026-07-04 07:49:55'),(7,5,'Daily','13:29:00','2026-07-04','Local Drive',NULL,'30 Days',1,1,'Paused','2026-07-04 07:58:15'),(8,2,'Daily','13:34:00','2026-07-04','Local Drive',NULL,'30 Days',1,1,'Paused','2026-07-04 08:02:31'),(9,7,'Daily','19:41:00','2026-07-04','Local Drive',NULL,'30 Days',1,1,'Active','2026-07-04 14:09:48'),(10,13,'Daily','10:45:00','2026-07-05','Local Drive',NULL,'30 Days',0,0,'Active','2026-07-05 05:13:18');
/*!40000 ALTER TABLE `backup_schedules` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backups`
--

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
INSERT INTO `backups` VALUES (2,2,'2026-06-21 17:15:22','18 Minutes','5.8 GB','Success',NULL,'D:/mysql_backups/mysql_prod.bkp'),(3,3,'2026-06-21 17:15:22','10 Minutes','1.2 GB','Success',NULL,'D:/oracle_test_backups/oracle_test.bkp'),(4,3,'2026-06-21 18:54:23','25s','108.5 GB','Success',NULL,'D:/DatabaseBackup/ICARD/'),(5,NULL,'2026-06-21 19:08:49','25s','108.5 GB','Success',NULL,'F:/UTS_Backup_Share/'),(7,NULL,'2026-06-22 04:44:15','05s','12.8 GB','Success',NULL,'/var/backups/coa/'),(8,NULL,'2026-06-22 04:46:00','25s','108.5 GB','Success',NULL,'E:/Backups/FOIS/'),(9,NULL,'2026-06-22 09:49:33','25s','108.5 GB','Success',NULL,'F:/UTS_Backup_Share/'),(10,NULL,'2026-06-22 10:10:09','25s','108.5 GB','Success',NULL,'F:/UTS_Backup_Share/'),(11,NULL,'2026-06-22 10:12:13','25s','108.5 GB','Success',NULL,'E:/Backups/FOIS/'),(12,3,'2026-06-22 11:31:17','25s','108.5 GB','Success',NULL,'D:/DatabaseBackup/ICARD/'),(13,NULL,'2026-06-22 11:32:11','05s','12.8 GB','Success',NULL,'/var/backups/coa/'),(14,3,'2026-06-23 12:31:32','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782198092022.sql'),(16,3,'2026-06-23 12:46:57','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782199016909.sql'),(17,3,'2026-06-24 17:03:39','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782300818961.sql'),(18,3,'2026-06-24 22:56:25','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782321984890.dump'),(19,2,'2026-06-25 00:36:03','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782327963475.dump'),(20,2,'2026-06-25 00:45:35','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782328535335.dump'),(21,2,'2026-06-27 12:55:07','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782545106920.dump'),(22,2,'2026-06-28 11:35:42','5s','12.8 GB','Success',NULL,'C:/backup/backup_1782626741916.dump'),(23,2,'2026-07-04 11:59:11','0.28s','8.10 KB','Success','MD5: 86c5d2c95604081f7ca5138657023add','D:\\mysql_backups\\MySQL_PROD_backup_1783146550782.dump'),(25,5,'2026-07-04 12:39:37','0.45s','8.41 KB','Success','MD5: be5da216237c45c5a9b87faa84401ad3','D:\\DatabaseBackup\\Backup-Test-DB\\Backup-Test-DB_backup_1783148976937.dump'),(26,2,'2026-07-04 13:02:12','0.27s','10.13 KB','Success','Manual run. MD5: a6294aa42d0bc4dc9e19aa54fa206ec8','D:\\mysql_backups\\MySQL_PROD_manual_1783150331843.dump'),(27,6,'2026-07-04 13:05:00','0.06s','0 KB','Failed','Scheduled backup failed: Command failed: \"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe\" -h 127.0.0.1 -P 1521 -u admin --password=\"your_password\"  > \"D:\\DatabaseBackup\\Backup-Test-Ds\\Backup-Test-Ds_scheduled_17831','D:\\DatabaseBackup\\Backup-Test-Ds\\Backup-Test-Ds_scheduled_1783150500009.dump'),(28,8,'2026-07-04 13:09:00','0.06s','0 KB','Failed','Scheduled backup failed: Command failed: \"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe\" -h 10.180.18.2 -P 3306 -u admin --password=\"\"  > \"D:\\DatabaseBackup\\IRCTC\\IRCTC_scheduled_1783150740006.dump\"\nmysqldump: [Wa','D:\\DatabaseBackup\\IRCTC\\IRCTC_scheduled_1783150740006.dump'),(29,10,'2026-07-04 13:14:21','21.11s','0 KB','Failed','Scheduled backup failed: Command failed: \"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe\" -h 10.180.20.2 -P 3306 -u admin --password=\"123456\" backup_monitoring > \"D:\\DatabaseBackup\\CSR\\CSR_scheduled_1783151040018.d','D:\\DatabaseBackup\\CSR\\CSR_scheduled_1783151040018.dump'),(30,11,'2026-07-04 13:21:21','21.11s','0 KB','Failed','Scheduled backup failed: Command failed: \"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe\" -h 10.180.18.1 -P 3306 -u admin --password=\"123456\" backup_monitoring > \"D:\\DatabaseBackup\\iPhone\\iPhone_scheduled_178315146','D:\\DatabaseBackup\\iPhone\\iPhone_scheduled_1783151460011.dump'),(31,5,'2026-07-04 13:24:32','0.35s','12.48 KB','Success','MD5: 16edf013205e9ba4d92f2037723148a7','D:\\DatabaseBackup\\Backup-Test-DB\\Backup-Test-DB_backup_1783151672463.dump'),(32,5,'2026-07-04 13:29:00','0.15s','12.75 KB','Success','Scheduled backup. MD5: 1c09d3db107c5e4ff8c4c92fc6fd8c09','D:\\DatabaseBackup\\Backup-Test-DB\\Backup-Test-DB_scheduled_1783151940004.dump'),(33,5,'2026-07-04 13:33:04','0.43s','13.23 KB','Success','MD5: 634a39f532b233a2976b5b00407e039a','D:\\DatabaseBackup\\Backup-Test-DB\\Backup-Test-DB_backup_1783152184401.dump'),(34,2,'2026-07-04 13:34:00','0.20s','13.40 KB','Success','Scheduled backup. MD5: 8a2448124de829aa5d016ea2212df91d','D:\\mysql_backups\\MySQL_PROD_scheduled_1783152240004.dump'),(35,7,'2026-07-04 19:24:02','0.44s','13.17 KB','Success','MD5: ef3802e48c06e46a54f1e5b6d567ac3b','D:\\DatabaseBackup\\DEMO\\DEMO_backup_1783173242090.dump'),(36,11,'2026-07-04 19:37:23','21.18s','0 KB','Failed','Manual run failed: Command failed: \"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe\" -h 10.180.18.1 -P 3306 -u admin --password=\"123456\" backup_monitoring > \"D:\\DatabaseBackup\\iPhone\\iPhone_backup_178317402215',NULL),(37,7,'2026-07-04 19:41:00','0.17s','13.71 KB','Success','Scheduled backup. MD5: 395f37e16cc355e8ded21ce67817ca0b','D:\\DatabaseBackup\\DEMO\\DEMO_scheduled_1783174260022.dump'),(38,13,'2026-07-05 10:45:21','21.22s','0 KB','Failed','Scheduled backup failed: Command failed: \"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe\" -h 10.180.18.2 -P 3306 -u admin --password=\"123456\" backup_monitoring > \"D:\\DatabaseBackup\\DEMO3\\DEMO_3_scheduled_1783228500','D:\\DatabaseBackup\\DEMO3\\DEMO_3_scheduled_1783228500012.dump'),(40,15,'2026-07-05 11:05:57','0.26s','0 KB','Failed','Manual run failed: Command failed: \"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe\" -h localhost -P 3306 -u admin --password=\"123456\" backup_monitoring > \"D:\\DatabaseBackup\\TATA\\TATA_backup_1783229757721.dump',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instances`
--

LOCK TABLES `instances` WRITE;
/*!40000 ALTER TABLE `instances` DISABLE KEYS */;
INSERT INTO `instances` VALUES (2,'MySQL PROD','localhost','MySQL',3306,'Connected','D:/mysql_backups','root','Production MySQL','2026-06-19 08:26:09','backup_monitoring','abcABC123@'),(3,'Oracle TEST','192.168.1.100','Oracle',1521,'Connected','D:/DatabaseBackup/OracleTEST/','admin','Newly registered node. Telemetry operational.','2026-06-19 08:44:23',NULL,'your_password'),(4,'Oracle DEV','192.168.1.100','Oracle',1521,'Connected','D:/DatabaseBackup/OracleDEV/','admin','Newly registered node. Telemetry operational.','2026-06-21 19:07:21',NULL,'your_password'),(5,'Backup-Test-DB','localhost','MySQL',3306,'Connected','D:/DatabaseBackup/Backup-Test-DB/','root','Newly registered node. Telemetry operational.','2026-06-22 09:59:51','backup_monitoring','abcABC123@'),(6,'Backup-Test-Ds','127.0.0.1','Oracle',1521,'Connected','D:/DatabaseBackup/Backup-Test-Ds/','admin','Newly registered node. Telemetry operational.','2026-06-22 11:30:09',NULL,'your_password'),(7,'DEMO','localhost','MySQL',3306,'Connected','D:/DatabaseBackup/DEMO/','root','Newly registered node. Telemetry operational.','2026-07-04 06:18:56','backup_monitoring','abcABC123@'),(8,'IRCTC','10.180.18.2','MySQL',3306,'Connected','D:/DatabaseBackup/IRCTC/','admin','Newly registered node. Telemetry operational.','2026-07-04 06:30:56',NULL,NULL),(10,'CSR','10.180.20.2','MySQL',3306,'Connected','D:/DatabaseBackup/CSR/','admin','Newly registered node. Telemetry operational.','2026-07-04 07:42:23','backup_monitoring','123456'),(11,'iPhone','10.180.18.1','MySQL',3306,'Disconnected','D:/DatabaseBackup/iPhone/','admin','Newly registered node. Telemetry operational.','2026-07-04 07:48:59','backup_monitoring','123456'),(12,'DEMO 2','10.180.18.2','MySQL',3306,'Connected','D:/DatabaseBackup/DEMO2/','admin','Newly registered node. Telemetry operational.','2026-07-04 08:01:17','backup_monitoring','123456'),(13,'DEMO 3','10.180.18.2','MySQL',3306,'Disconnected','D:/DatabaseBackup/DEMO3/','admin','Newly registered node. Telemetry operational.','2026-07-05 05:12:32','backup_monitoring','123456'),(15,'TATA','localhost','MySQL',3306,'Disconnected','D:/DatabaseBackup/TATA/','admin','Newly registered node. Telemetry operational.','2026-07-05 05:35:44','backup_monitoring','123456');
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

-- Dump completed on 2026-07-05 11:11:20

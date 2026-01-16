CREATE TABLE `deleted_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemType` enum('thread','tweet') NOT NULL,
	`threadId` varchar(64) NOT NULL,
	`tweetIndex` int,
	`deletedAt` timestamp NOT NULL DEFAULT (now()),
	`deletedBy` int,
	CONSTRAINT `deleted_items_id` PRIMARY KEY(`id`)
);

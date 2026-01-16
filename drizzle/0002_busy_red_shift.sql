CREATE TABLE `tweet_edits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` varchar(64) NOT NULL,
	`tweetIndex` int NOT NULL,
	`editedText` text,
	`hiddenMedia` json,
	`editedAt` timestamp NOT NULL DEFAULT (now()),
	`editedBy` int,
	CONSTRAINT `tweet_edits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`threadId` varchar(64) NOT NULL,
	`favoritedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_favorites_id` PRIMARY KEY(`id`)
);

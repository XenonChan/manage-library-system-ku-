CREATE TABLE `book` (
  `id_` int(250) NOT NULL,
  `name` varchar(250) NOT NULL,
  `bookid` varchar(250) NOT NULL,
  `img` varchar(250) NOT NULL,
  `amount` int(250) NOT NULL,
  `borrowed` int(250) NOT NULL,
  `score` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
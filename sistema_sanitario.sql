-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-10-2024 a las 12:08:40
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_sanitario`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `centros`
--

CREATE TABLE `centros` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `centros`
--

INSERT INTO `centros` (`id`, `nombre`) VALUES
(1, 'Hospital General de Alicante'),
(2, 'Hospital General de Elche'),
(3, 'Hospital de Torrevieja'),
(4, 'Hospital la Fe'),
(5, 'Hospital de San Juan'),
(6, 'Hospital Marina Baixa'),
(7, 'Hospital de Dénia'),
(8, 'Hospital de La Plana'),
(9, 'Hospital Comarcal de Vinaròs'),
(10, 'Hospital General de Castellón');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialidades`
--

CREATE TABLE `especialidades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `especialidades`
--

INSERT INTO `especialidades` (`id`, `nombre`) VALUES
(1, 'Cardiología'),
(2, 'Dermatología'),
(3, 'Hematología'),
(4, 'Neumología');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_expedientes`
--

CREATE TABLE `estado_expedientes` (
  `Identificador` int(11) NOT NULL,
  `Estado` varchar(20) NOT NULL,
  `Dificultad` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado_expedientes`
--

INSERT INTO `estado_expedientes` (`Identificador`, `Estado`, `Dificultad`) VALUES
(1, 'Iniciado', 'Media'),
(2, 'iniciado', 'Alta'),
(3, 'iniciado', 'medio'),
(4, 'finalizado', 'medio'),
(5, 'iniciado', 'medio');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `expedientes`
--

CREATE TABLE `expedientes` (
  `id` int(11) NOT NULL,
  `map` int(11) NOT NULL,
  `me` int(11) DEFAULT NULL,
  `especialidad` int(11) NOT NULL,
  `sip` varchar(20) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` int(11) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `solicitud` text NOT NULL,
  `respuesta` text DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_asignacion` datetime DEFAULT NULL,
  `fecha_resolucion` datetime DEFAULT NULL,
  `estado_expediente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `expedientes`
--

INSERT INTO `expedientes` (`id`, `map`, `me`, `especialidad`, `sip`, `nombre`, `apellidos`, `fecha_nacimiento`, `genero`, `observaciones`, `solicitud`, `respuesta`, `fecha_creacion`, `fecha_asignacion`, `fecha_resolucion`, `estado_expediente`) VALUES
(4, 1, 5, 2, '1096923', 'María', 'Huertas Martínez', '1993-12-30', 1, NULL, 'Calambres', NULL, '2024-03-16 11:39:01', '2024-03-20 08:31:22', NULL, 2),
(5, 2, NULL, 1, '1433490', 'Estefanía', 'Romero Maldonado', '1993-12-30', 2, NULL, 'Dolor de estómago', NULL, '2024-03-18 10:39:01', NULL, NULL, NULL),
(6, 2, NULL, 2, '7890123', 'Carlos', 'Pérez Rodriguez', '1985-07-14', 2, 'Diabetes', 'Control de azúcar', NULL, '2024-04-15 09:20:15', NULL, NULL, NULL),
(7, 2, 4, 1, '6543210', 'Ana', 'Martínez López', '1978-11-22', 1, 'Hipertensión', 'Revisión anual', NULL, '2024-05-01 11:45:00', '2024-05-02 09:00:00', NULL, NULL),
(8, 2, 6, 2, '5678901', 'Luis', 'García Sánchez', '1990-03-15', 2, 'Alergia al polen', 'Tratamiento alergia', NULL, '2024-05-10 13:15:30', '2024-05-11 14:00:00', NULL, 2),
(9, 1, NULL, 2, '0498274', 'Sandra', 'Coronado López', '2008-05-08', 1, 'Dermatitis alérgica', 'Prueba cutánea', NULL, '2024-09-29 17:23:30', NULL, NULL, 1),
(10, 1, 3, 1, '5446354', 'Eustaquia', 'Marín Boya', '2024-09-11', 1, 'Tiene taquicardias', 'REvisenla', '', '2024-09-30 15:42:24', '2024-09-30 15:42:39', '2024-09-30 15:42:42', 1),
(11, 1, NULL, 4, '543563', 'Andrea del Carmen', 'Castellano López', '2005-10-08', 1, 'Tiene tos', 'Revisale los pulmones', NULL, '2024-10-05 23:41:25', NULL, NULL, NULL),
(12, 1, NULL, 1, '547858', 'Roberto', 'Brasero Sánchez', '2007-02-13', 2, 'Le duele el pecho', 'miraselo', NULL, '2024-10-07 17:54:52', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fotos`
--

CREATE TABLE `fotos` (
  `id` int(11) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `expediente` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fotos`
--

INSERT INTO `fotos` (`id`, `fecha`, `expediente`) VALUES
(4, '2024-10-12 14:44:18', 4),
(5, '2024-10-12 14:57:03', 10),
(7, '2024-10-15 19:10:06', 12),
(8, '2024-10-15 19:10:45', 4),
(9, '2024-10-15 19:11:55', 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicos`
--

CREATE TABLE `medicos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `login` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `especialidad` int(11) DEFAULT NULL,
  `centro` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medicos`
--

INSERT INTO `medicos` (`id`, `nombre`, `apellidos`, `login`, `password`, `especialidad`, `centro`) VALUES
(1, 'Alicia', 'Fernández Medina', 'map1', 'map1', NULL, 3),
(2, 'Foley', 'Cisse Camara', 'map2', 'map2', NULL, 1),
(3, 'Andrea Mei', 'Sala Aracil', 'me1', 'me1', 1, 5),
(4, 'Juan', 'Martínez Pérez', 'me2', 'me2', 1, 4),
(5, 'María', 'Gómez Sánchez', 'me3', 'me3', 2, 2),
(6, 'Carlos', 'García López', 'me4', 'me4', 2, 3);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `centros`
--
ALTER TABLE `centros`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estado_expedientes`
--
ALTER TABLE `estado_expedientes`
  ADD PRIMARY KEY (`Identificador`);

--
-- Indices de la tabla `expedientes`
--
ALTER TABLE `expedientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exp_esp` (`especialidad`),
  ADD KEY `exp_map` (`map`),
  ADD KEY `exp_me` (`me`),
  ADD KEY `exp_est` (`estado_expediente`);

--
-- Indices de la tabla `fotos`
--
ALTER TABLE `fotos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fot_exp` (`expediente`);

--
-- Indices de la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login` (`login`),
  ADD KEY `med_centro` (`centro`),
  ADD KEY `med_esp` (`especialidad`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `centros`
--
ALTER TABLE `centros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `estado_expedientes`
--
ALTER TABLE `estado_expedientes`
  MODIFY `Identificador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `expedientes`
--
ALTER TABLE `expedientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `fotos`
--
ALTER TABLE `fotos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `medicos`
--
ALTER TABLE `medicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `expedientes`
--
ALTER TABLE `expedientes`
  ADD CONSTRAINT `exp_esp` FOREIGN KEY (`especialidad`) REFERENCES `especialidades` (`id`),
  ADD CONSTRAINT `exp_est` FOREIGN KEY (`estado_expediente`) REFERENCES `estado_expedientes` (`Identificador`),
  ADD CONSTRAINT `exp_map` FOREIGN KEY (`map`) REFERENCES `medicos` (`id`),
  ADD CONSTRAINT `exp_me` FOREIGN KEY (`me`) REFERENCES `medicos` (`id`);

--
-- Filtros para la tabla `fotos`
--
ALTER TABLE `fotos`
  ADD CONSTRAINT `fot_exp` FOREIGN KEY (`expediente`) REFERENCES `expedientes` (`id`);

--
-- Filtros para la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD CONSTRAINT `med_centro` FOREIGN KEY (`centro`) REFERENCES `centros` (`id`),
  ADD CONSTRAINT `med_esp` FOREIGN KEY (`especialidad`) REFERENCES `especialidades` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

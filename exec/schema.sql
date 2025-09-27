DROP DATABASE IF EXISTS ygss;

CREATE DATABASE ygss;

use ygss;

-- 위험등급 --
-- 1.사용자 위험등급 --
CREATE TABLE `user_risk_grade`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `grade` VARCHAR(100) NOT NULL, 
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '사용자 위험도 분류 저장';
-- 2.상품 위험등급 --
CREATE TABLE `product_risk_grade`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `grade` VARCHAR(100) NOT NULL, 
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '상품 위험도 분류 저장';

-- 회원정보 --
-- 1. 회원 기본 정보 --
CREATE TABLE `users`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(30) NOT NULL COMMENT '사용자 이름', 
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) COMMENT '회원의 기본정보를 저장';
-- 2. 회원 계정 정보 --
CREATE TABLE `user_accounts`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT 'users(id) 테이블 FK',
    `email` VARCHAR(100) NOT NULL UNIQUE KEY COMMENT '로그인에 사용할 Email',
    `password` VARCHAR(100) NOT NULL COMMENT '로그인에 사용할 Password',
    `new_emp` BOOLEAN DEFAULT TRUE COMMENT '신입 / 경력',
    `salary` BIGINT NOT NULL COMMENT '에상/현재 월급/연봉',
    `total_retire_pension` BIGINT DEFAULT 0 COMMENT '현재까지 쌓인 퇴직연금',
    `risk_grade_id` BIGINT DEFAULT NULL COMMENT '위험등급',
    `ban` BOOLEAN DEFAULT FALSE COMMENT '벤 여부',
    `exit` DATETIME DEFAULT NULL COMMENT '탈퇴 여부',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    foreign key(`user_id`) references `users`(`id`)
		ON DELETE CASCADE
		ON UPDATE CASCADE
) COMMENT '회원의 계정정보를 저장';
-- 3. 토큰 관리 --
CREATE TABLE `user_refresh_token`(
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT 'users(id) 테이블 FK',
    `refresh_token` VARCHAR(512) NOT NULL UNIQUE KEY,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `exit` DATETIME NOT NULL,
    foreign key(`user_id`) references `users`(`id`)
		ON DELETE CASCADE
		ON UPDATE CASCADE
) COMMENT '리프레쉬 토큰 정보를 저장';

-- 기업정보 --
-- 1.권역정보 --
CREATE TABLE `company_areas` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `area` VARCHAR(100) NOT NULL COMMENT '권역 지정: 1.은행, 2.증권, 3.자산운용, 4.생명보험, 5.손해보험',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='회사 권역에 대한 정보 저장';
-- 2.회사정보 --
CREATE TABLE `companies`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `area_id` BIGINT NOT NULL,
    `company` VARCHAR(100) NOT NULL UNIQUE KEY COMMENT '회사 이름',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(`area_id`) REFERENCES `company_areas`(`id`)
		ON DELETE CASCADE
        ON UPDATE CASCADE
) COMMENT '회사 정보 저장';

-- 퇴직연금 --
-- 1.상품종류 --
CREATE TABLE `retire_pension_systype` (
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY, 
    `systype` VARCHAR(100) NOT NULL COMMENT '상품 이름 : 1.DB, 2.DC, 3.DC(원리금보장), 4.IRP',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '퇴직연금 상품 종류 저장';
-- 2.수익률 --
CREATE TABLE `retire_pension_rate`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `company_id` BIGINT NOT NULL,
    `systype_id` BIGINT NOT NULL,
    `reserve` BIGINT NOT NULL COMMENT '총 적립금 (100만원 단위)',
    `earn_rate` DOUBLE NOT NULL COMMENT '조회 분기 기준 수익률',
    `earn_rate3` DOUBLE NOT NULL COMMENT '3년치 수익률',
    `earn_rate5` DOUBLE NOT NULL COMMENT '5년치 수익률',
    `earn_rate7` DOUBLE NOT NULL COMMENT '7년치 수익률',
    `earn_rate10` DOUBLE NOT NULL COMMENT '10년치 수익률',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(`company_id`) REFERENCES `companies`(`id`)
		ON DELETE CASCADE
        ON UPDATE CASCADE,
	FOREIGN KEY(`systype_id`) REFERENCES `retire_pension_systype`(`id`)
		ON DELETE CASCADE
        ON UPDATE CASCADE
) COMMENT '퇴직연금 수익률 정보 저장(금융사 기준)';
-- 4.상품종류 --
CREATE TABLE `retire_pension_product_type`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `product_type` VARCHAR(100) NOT NULL COMMENT '상품 종류 : 1.ETF, 2.펀드, 3.채권', 
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '퇴직연금 상품 종류';
-- 5.상품정보 -- 
CREATE TABLE `retire_pension_products`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `company_id` BIGINT NOT NULL,
    `systype_id` BIGINT NOT NULL,
    `product_type_id` BIGINT NOT NULL,
    `product` VARCHAR(255) NOT NULL COMMENT '상품명',
    `risk_grade_id` BIGINT NOT NULL,
    `reserve` BIGINT DEFAULT 0 COMMENT '운용자산',
    `expense_ratio` DOUBLE DEFAULT 0 COMMENT '수수료',
    `next_year_profit_rate` DOUBLE DEFAULT 0 COMMENT '내년 예상 수익률',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(`company_id`) REFERENCES `companies`(`id`)
		ON DELETE CASCADE
        ON UPDATE CASCADE,
	FOREIGN KEY(`systype_id`) REFERENCES `retire_pension_systype`(`id`)
		ON DELETE CASCADE
        ON UPDATE CASCADE,
	FOREIGN KEY(`product_type_id`) REFERENCES `retire_pension_product_type`(`id`)
		ON DELETE CASCADE
        ON UPDATE CASCADE,
	FOREIGN KEY(`risk_grade_id`) REFERENCES `product_risk_grade`(`id`)
		ON DELETE CASCADE
        ON UPDATE CASCADE,
	UNIQUE KEY `company_product` (`company_id`, `product`)
) COMMENT '증권사별 퇴직연금 상품 저장';
-- 6. 채권상품정보 --
CREATE TABLE `bond_products`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY, 
    `systype_id` BIGINT NOT NULL,
    `product_type_id` BIGINT NOT NULL,
    `product` VARCHAR(255) NOT NULL COMMENT '상품명',
    `risk_grade_id` BIGINT NOT NULL,
    `publisher_grade` VARCHAR(10) NOT NULL COMMENT '회사등급',
    `publisher` VARCHAR(255) NOT NULL COMMENT '발행처',
    `coupon_rate` DOUBLE DEFAULT 0 COMMENT '연 이자율',
    `published_rate` DOUBLE DEFAULT 0 COMMENT '매수단가',
	`evalution_rate` DOUBLE DEFAULT 0 COMMENT '민평단가',
    `maturity_years` INT NOT NULL DEFAULT 0 COMMENT '만기일(연단위)',
    `expired_day` DATE NOT NULL COMMENT '만기일', 
    `final_profit_rate` DOUBLE NOT NULL DEFAULT 0 COMMENT '만기시 이자율',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(`systype_id`) REFERENCES `retire_pension_systype`(`id`)
		ON DELETE CASCADE
        ON UPDATE CASCADE,
	FOREIGN KEY(`product_type_id`) REFERENCES `retire_pension_product_type`(`id`)
		ON DELETE CASCADE
        ON UPDATE CASCADE,
	FOREIGN KEY(`risk_grade_id`) REFERENCES `product_risk_grade`(`id`)
		ON DELETE CASCADE
        ON UPDATE CASCADE
) COMMENT '채권 정보만을 저장';
-- 7.구성상품 --
CREATE TABLE `product_categories` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `category_name` VARCHAR(100) NOT NULL UNIQUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '상품 카테고리';
CREATE TABLE `retire_pension_product_details`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY, 
    `super_product_id` BIGINT NOT NULL, 
    `product_type_id` BIGINT NOT NULL,
    `product` VARCHAR(255) NOT NULL,
    `weight` DOUBLE NULL COMMENT '포트폴리오 비중(%)',
    `category_id` BIGINT NULL COMMENT '카테고리 ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(`super_product_id`) REFERENCES `retire_pension_products`(`id`)
		ON UPDATE CASCADE
        ON DELETE CASCADE,
     FOREIGN KEY(`product_type_id`) REFERENCES `retire_pension_product_type`(`id`)
		ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL
) COMMENT 'ETF / 펀드의 구성 상품 목록을 저장';

CREATE INDEX `idx_super_product_weight` ON `retire_pension_product_details` (`super_product_id`, `weight` DESC);

CREATE TABLE `product_category_percentage` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `super_product_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `percentage` DECIMAL(5,2) NOT NULL DEFAULT 0,  -- 99.99% 까지 지원
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`super_product_id`) REFERENCES `retire_pension_products`(`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    UNIQUE KEY `uk_product_category` (`super_product_id`, `category_id`),
    INDEX `idx_super_product` (`super_product_id`)
) COMMENT '상품별 카테고리 비중(%) 집계 테이블';

-- 8.ETF/펀드 찜 --
CREATE TABLE `retire_pension_product_like`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_account_id` BIGINT NOT NULL,
    `retire_pension_product_id` BIGINT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(`user_account_id`) REFERENCES `user_accounts`(`id`)
		ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(`retire_pension_product_id`) REFERENCES `retire_pension_products`(`id`)
		ON UPDATE CASCADE
        ON DELETE CASCADE
) COMMENT 'ETF / 펀드 상품 찜 저장';
-- 9.채권 찜 --
CREATE TABLE `bond_product_like`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_account_id` BIGINT NOT NULL,
    `bond_product_id` BIGINT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(`user_account_id`) REFERENCES `user_accounts`(`id`)
		ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(`bond_product_id`) REFERENCES `bond_products`(`id`)
		ON UPDATE CASCADE
        ON DELETE CASCADE
) COMMENT '채권 상품 찜 저장';
-- 10.ETF/펀드 시계열 데이터 --
CREATE TABLE `retire_pension_product_price_log`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY, 
    `retire_pension_product_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `init_price` INT NOT NULL, 
    `final_price` INT NOT NULL,
    `daily_rate` DOUBLE NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(`retire_pension_product_id`) REFERENCES `retire_pension_products`(`id`)
		ON UPDATE CASCADE
        ON DELETE CASCADE
) COMMENT "ETF/펀드 시계열 데이터 저장";
-- 11. 채권 시계열 데이터 저장 --
CREATE TABLE `bond_product_price_log`(
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `bond_product_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `init_price` INT NOT NULL, 
    `final_price` INT NOT NULL,
    `daily_rate` DOUBLE NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(`bond_product_id`) REFERENCES `bond_products`(`id`)
		ON UPDATE CASCADE
        ON DELETE CASCADE
) COMMENT '채권 시계열 데이터 저장';

-- 투자성향분석 --
-- 1. 질문 --
CREATE TABLE `risk_grade_questions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `question` TEXT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '투자 성향 질문';

CREATE TABLE `risk_grade_options` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `question_id` BIGINT NOT NULL,
    `option` TEXT NOT NULL,
    `score` INT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(`question_id`) REFERENCES `risk_grade_questions`(`id`)
		ON UPDATE CASCADE
      ON DELETE CASCADE
) COMMENT '투자 성향에 대한 선택옵션';

-- 챗봇 --
-- 1.용어 정의 --
CREATE TABLE `term_dictionary` (
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
	`term` VARCHAR(255) NOT NULL UNIQUE KEY COMMENT '용어',
	`desc` TEXT NOT NULL COMMENT '설명',
	`created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP		
) COMMENT '챗봇에서 사용할 용어 테이블';

CREATE TABLE `chat_dummy` (
	`id` BIGINT AUTO_INCREMENT PRIMARY KEY,
	`term_id` BIGINT NOT NULL,
	`question` TEXT NOT NULL,
	`answer` TEXT NOT NULL,
	`created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY(`term_id`) REFERENCES `term_dictionary`(`id`)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) COMMENT '각 용어에 대한 QnA';

CREATE TABLE `chat_logs` (
   `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
   `sid` VARCHAR(36) NOT NULL,
   `question` TEXT NOT NULL,
   `answer` TEXT NOT NULL,
   `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
   `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '채팅방에 대한 로그를 기록';

CREATE TABLE market (
    id INT PRIMARY KEY AUTO_INCREMENT,
    `date` DATE NOT NULL COMMENT '날짜',
    kospi DOUBLE NOT NULL COMMENT '코스피 지수',
    oil_price DOUBLE NOT NULL COMMENT '유가',
    interest_rate DOUBLE NOT NULL COMMENT '금리(%)',
    price_index DOUBLE NOT NULL COMMENT '물가지수',
    cny_rate DOUBLE NOT NULL COMMENT '위안화 환율',
    usd_rate DOUBLE NOT NULL COMMENT '달러 환율',
    jpy_rate DOUBLE NOT NULL COMMENT '엔화 환율',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시'
);

-- 기타함수 --
DELIMITER $$

-- 1.회사 권역 조회 --
CREATE FUNCTION `get_company_area_id`(`name` VARCHAR(100))
RETURNS BIGINT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE `area_id` BIGINT;
    
    SELECT `id`
    INTO `area_id`
    FROM `company_areas`
    WHERE `name` LIKE CONCAT('%', `area`)
    LIMIT 1;

    RETURN `area_id`;
END$$

-- 2.회사 조회 --
CREATE FUNCTION `get_company_id`(`name` VARCHAR(100))
RETURNS BIGINT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE `company_id` BIGINT;

    -- 1. 먼저, 주어진 이름과 정확히 일치하는 회사를 찾습니다.
    SELECT `id`
    INTO `company_id`
    FROM `companies`
    WHERE `company` = `name`
    LIMIT 1;

    -- 2. 만약 회사를 찾지 못했다면, 새로운 회사를 추가합니다.
    IF `company_id` IS NULL THEN
        -- get_company_area_id() 함수는 이미 존재한다고 가정합니다.
        INSERT INTO `companies` (`area_id`, `company`) VALUES
        (get_company_area_id(`name`), `name`);

        -- 3. 새로 삽입된 레코드의 ID를 가져와 변수에 할당합니다.
        SET `company_id` = LAST_INSERT_ID();
    END IF;

    -- 4. 마지막으로, 찾아냈거나 새로 생성된 ID를 반환합니다.
    RETURN `company_id`;
END$$
-- 3.ETF/펀드 id 찾기 --
CREATE FUNCTION `get_retire_pension_product_id`(`name` VARCHAR(100))
RETURNS BIGINT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE `retire_pension_product_id` BIGINT;
    
    SELECT `id`
    INTO `retire_pension_product_id`
    FROM `retire_pension_products`
    WHERE `product` LIKE `name`
    LIMIT 1;

    RETURN `retire_pension_product_id`;
END$$

CREATE FUNCTION `get_bond_product_id`(`name` VARCHAR(100))
RETURNS BIGINT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE `bond_product_id` BIGINT;
    
    SELECT `id`
    INTO `bond_product_id`
    FROM `bond_products`
    WHERE `product` LIKE `name`
    LIMIT 1;

    RETURN `bond_product_id`;
END$$

CREATE FUNCTION get_product_id(product_name VARCHAR(500))
RETURNS BIGINT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE product_id BIGINT DEFAULT NULL;
    SELECT id INTO product_id FROM retire_pension_products WHERE product = product_name LIMIT 1;
    RETURN product_id;
END $$

CREATE FUNCTION get_category_id(category_name VARCHAR(100))
RETURNS BIGINT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE category_id BIGINT DEFAULT NULL;
    SELECT id INTO category_id FROM product_categories pc WHERE category_name = pc.category_name LIMIT 1;
    RETURN category_id;
END $$

CREATE PROCEDURE UpdateProductCategoryPercentage(
    IN p_super_product_id BIGINT
)
BEGIN
    DELETE FROM product_category_percentage 
    WHERE super_product_id = p_super_product_id;
    
    INSERT INTO product_category_percentage (
        super_product_id, 
        category_id, 
        percentage
    )
    SELECT 
        category_summary.super_product_id,
        category_summary.category_id,
        ROUND((category_summary.category_weight / product_totals.product_total_weight) * 100, 2) AS percentage
    FROM (
        SELECT 
            super_product_id,
            category_id,
            SUM(weight) AS category_weight
        FROM retire_pension_product_details
        WHERE super_product_id = p_super_product_id
          AND category_id IS NOT NULL 
          AND weight IS NOT NULL
        GROUP BY super_product_id, category_id
    ) category_summary
    JOIN (
        SELECT 
            super_product_id,
            SUM(weight) AS product_total_weight
        FROM retire_pension_product_details
        WHERE super_product_id = p_super_product_id
          AND category_id IS NOT NULL 
          AND weight IS NOT NULL
        GROUP BY super_product_id
    ) product_totals ON category_summary.super_product_id = product_totals.super_product_id;
    
END$$

CREATE FUNCTION `rand_double`(_min_val DOUBLE, _max_val DOUBLE) 
RETURNS DOUBLE
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_ret DOUBLE;
    
    SET v_ret = _min_val + RAND() * (_max_val - _min_val);
    
    RETURN v_ret;
END$$

DELIMITER ;
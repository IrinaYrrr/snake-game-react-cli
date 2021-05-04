const React = require('react');
const { Text, Box, useStdin } = require('ink');
const { useState, useEffect } = require('react');
const useInterval = require('./useInterval');
const importJsx = require('import-jsx');
const EndScreen = importJsx('./endScreen');

// Константы с кодами кнопок клавиатуры
const ARROW_UP = "\u001B[A";
const ARROW_DOWN = "\u001B[B";
const ARROW_RIGHT = "\u001B[C";
const ARROW_LEFT = "\u001B[D";

// Размер поля
const FIELD_SIZE = 16;

// Ряд поля - содержит ячейки каждого ряда
// [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
const FIELD_ROW = [...new Array(FIELD_SIZE).keys()];

// Храним координаты еды
let foodItem = newFoodItem();

// Новые координаты еды 
function newFoodItem() {
    return {
        x: Math.floor(Math.random() * FIELD_SIZE),
        y: Math.floor(Math.random() * FIELD_SIZE),
    };
}

// Все направления движения змейки
const DIRECTION = {
    RIGHT: { x: 1, y: 0 },
    LEFT: { x: -1, y: 0 },
    TOP: { x: 0, y: -1 },
    BOTTOM: { x: 0, y: 1 },
}

// Проверка ячейки на наличие еды или змейки и отображение еды, змеи или точки
function getItem(x, y, snakeSegments) {
    // Если текущие координаты совпадают с координатами еды, отображаем еду
    if (foodItem.x === x && foodItem.y === y) {
        return <Text>🐭</Text>
    }

    // Если текущие координаты совпадают с координатами змеи, отображаем змею
    for (const segment of snakeSegments) {
        if (segment.x === x && segment.y === y) {
            return <Text>🐍</Text>
        }
    }

    // Если не еда и не змейка - отображаем точку
    return <Text> . </Text>
}

// Ограничиваем передвижение размером поля. j - это координата
function limitByField(j) {
    if (j >= FIELD_SIZE) {
        return 0;
    }
    if (j < 0) {
        return FIELD_SIZE - 1;
    }
    return j;
}

// Расчет направления движения змейки.
// segments - составляющие змейки
// direction - координаты направления движения
function newSnakePosition(segments, direction) {
    // head -координаты головы змейки
    const [head] = segments;
    // Новые координаты головы змейки
    const newHead = {
        x: limitByField(head.x + direction.x),
        y: limitByField(head.y + direction.y)
    };
    // Eсли столкнулись с едой, змейка растет
    if (eatFood(newHead, foodItem)) {
        foodItem = newFoodItem();
        return [newHead, ...segments];
    };
    //Не съели еду - координаты сегментов - голова + все сегменты без последнего
    return [newHead, ...segments.slice(0, -1)];
}

// Определяет что мы столкнулись с едой 
// Сравнивает координаты головы и еды и если они совпадают, возвращаем true
function eatFood(head, foodItem) {
    if (head.x === foodItem.x && head.y === foodItem.y) {
        return true;
    }
    return false;
}

// Проверка умерла ли змейка
function isSnakeDead(segments) {
    const [head, ...tail] = segments;
    const snakeEatItSelf = tail.find(segment => segment.x === head.x && segment.y === head.y);
    if (snakeEatItSelf) {
        return true;
    }
    return false;
}



// Создание игрового поля:
const App = () => {
    // Добавляем координаты змейки используя хук 'useState':
    const [snakeSegments, setSnakeSegments] = useState([
        { x: 8, y: 6 },
        { x: 8, y: 7 },
        { x: 8, y: 8 },
    ]);

    // Задаем стартовое направление змейки:
    const [direction, setDirection] = useState(DIRECTION.LEFT);

    const { stdin, setRawMode } = useStdin();

    useEffect(() => {
        setRawMode(true);
        stdin.on("data", data => {
            const value = data.toString();
            if (value == ARROW_UP) {
                setDirection(DIRECTION.TOP);
            }
            if (value == ARROW_DOWN) {
                setDirection(DIRECTION.BOTTOM);
            }
            if (value == ARROW_LEFT) {
                setDirection(DIRECTION.LEFT);
            }
            if (value == ARROW_RIGHT) {
                setDirection(DIRECTION.RIGHT);
            }
        });
    }, []);

    const snakeDead = isSnakeDead(snakeSegments);

    // Таймер в реакте с хуками
    // Изменение координат змейки через промежуток времени
    useInterval(() => {
        setSnakeSegments(segments => newSnakePosition(segments, direction))
    }, snakeDead ? null : 200);


    return (
        <Box flexDirection='column' alignItems='center'>
            <Text>
                <Text color="green">Snake</Text> game
				</Text>
            {snakeDead ? (
                <EndScreen size={FIELD_SIZE} />
            ) : (
                /* игровое поле */
                <Box flexDirection='column'>
                    {/* рисуем двухмерное поле */}
                    {FIELD_ROW.map(y => (
                        // столбцы; key - число от 0 до FIELD_SIZE
                        <Box key={y}>
                            {FIELD_ROW.map(x => (
                                // строки; key - число от 0 до FIELD_SIZE
                                <Box key={x}>
                                    <Text> {getItem(x, y, snakeSegments)} </Text>
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>
            )}


        </Box>
    );
};

module.exports = App;
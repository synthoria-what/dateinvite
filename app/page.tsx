"use client";

import { useCallback, useMemo, useState } from "react";

type Position = {
  x: number;
  y: number;
};

type Step = "invite" | "date" | "confirmed";

const START_NO_POSITION: Position = { x: 62, y: 39 };
const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

function nextPosition(): Position {
  return {
    x: 4 + Math.random() * 68,
    y: 27 + Math.random() * 52,
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function sameMonth(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth()
  );
}

function getCalendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - mondayOffset + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    return new Date(year, monthIndex, dayNumber);
  });
}

function formatMonth(date: Date) {
  const value = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date);

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatSelectedDate(date: Date) {
  const value = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  return `${value.charAt(0).toUpperCase() + value.slice(1)} · 15:00`;
}

export default function Home() {
  const [step, setStep] = useState<Step>("invite");
  const [today] = useState(() => startOfDay(new Date()));
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [noPosition, setNoPosition] = useState(START_NO_POSITION);
  const [noEscapes, setNoEscapes] = useState(0);

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );

  const dodgeNo = useCallback(() => {
    setNoPosition(nextPosition());
    setNoEscapes((count) => count + 1);
  }, []);

  const canGoBack = !sameMonth(visibleMonth, today);

  function changeMonth(offset: number) {
    setVisibleMonth(
      (month) => new Date(month.getFullYear(), month.getMonth() + offset, 1),
    );
  }

  if (step === "confirmed" && selectedDate) {
    return (
      <main className="page page--accepted">
        <section className="success-card" aria-live="polite">
          <div className="success-heart" aria-hidden="true">♥</div>
          <p className="eyebrow">официально подтверждено</p>
          <h1>Ура, мы выйдем на улицу!</h1>
          <p className="success-copy">
            Тогда я всё организую. Тебе остаётся только быть в хорошем настроении.
          </p>
          <div className="success-date">
            <span>встречаемся</span>
            <strong>{formatSelectedDate(selectedDate)}</strong>
          </div>
          <button className="text-button" type="button" onClick={() => setStep("date")}>
            выбрать другую дату
          </button>
        </section>
        <div className="confetti confetti--one" aria-hidden="true">✦</div>
        <div className="confetti confetti--two" aria-hidden="true">♥</div>
        <div className="confetti confetti--three" aria-hidden="true">✦</div>
      </main>
    );
  }

  if (step === "date") {
    return (
      <main className="page">
        <section className="date-picker-card" aria-labelledby="date-picker-title">
          <div className="card-topline">
            <button className="back-button" type="button" onClick={() => setStep("invite")}>
              ← назад
            </button>
            <span aria-hidden="true">♥</span>
          </div>

          <div className="date-picker-copy">
            <p className="eyebrow">остался один вопрос</p>
            <h1 id="date-picker-title">
              Выбери удобный
              <br />
              <em>день</em>
            </h1>
            <p className="subtitle">
              Теперь всё честно: календарь никуда не убежит.
            </p>
          </div>

          <div className="calendar">
            <div className="calendar-header">
              <button
                className="calendar-nav"
                type="button"
                onClick={() => changeMonth(-1)}
                disabled={!canGoBack}
                aria-label="Предыдущий месяц"
              >
                ←
              </button>
              <h2 aria-live="polite">{formatMonth(visibleMonth)}</h2>
              <button
                className="calendar-nav"
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Следующий месяц"
              >
                →
              </button>
            </div>

            <div className="calendar-weekdays" aria-hidden="true">
              {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
            </div>

            <div className="calendar-grid" role="grid" aria-label={formatMonth(visibleMonth)}>
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <span className="calendar-empty" key={`empty-${index}`} />;
                }

                const isPast = date < today;
                const isToday = sameDay(date, today);
                const isSelected = selectedDate ? sameDay(date, selectedDate) : false;

                return (
                  <button
                    className={[
                      "calendar-day",
                      isToday ? "calendar-day--today" : "",
                      isSelected ? "calendar-day--selected" : "",
                    ].filter(Boolean).join(" ")}
                    type="button"
                    role="gridcell"
                    key={date.toISOString()}
                    disabled={isPast}
                    aria-selected={isSelected}
                    aria-label={new Intl.DateTimeFormat("ru-RU", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    }).format(date)}
                    onClick={() => setSelectedDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="selected-date" aria-live="polite">
            {selectedDate
              ? formatSelectedDate(selectedDate)
              : "Выбери дату в календаре"}
          </div>

          <button
            className="confirm-button"
            type="button"
            disabled={!selectedDate}
            onClick={() => setStep("confirmed")}
          >
            {selectedDate ? "Подтвердить дату" : "Сначала выбери день"}
            <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="invite-card" aria-labelledby="invite-title">
        <div className="card-topline">
          <span>маленькое приглашение</span>
          <span aria-hidden="true">♥</span>
        </div>

        <div className="invite-copy">
          <p className="eyebrow">только для тебя</p>
          <h1 id="invite-title">
            Пойдёшь со мной
            <br />
            <em>гулять?</em>
          </h1>
          <p className="subtitle">
            Обещать ничего не могу, но будет жоски вайб) 😊
          </p>
        </div>

        <div className="date-card">
          <div className="calendar-mark" aria-hidden="true">
            <span>дата</span>
            <strong>?</strong>
          </div>
          <div>
            <span className="date-label">Когда встречаемся</span>
            <strong className="date-value">Выберем вместе</strong>
            <span className="date-place">Мы пойдем плотненько в кото-кофе</span>
          </div>
        </div>

        <div className="choice-area" aria-label="Ответ на приглашение">
          <p className="choice-question">Ну что, договорились?</p>
          <button className="yes-button" type="button" onClick={() => setStep("date")}>
            Да, конечно
            <span aria-hidden="true">→</span>
          </button>

          <button
            className="escape-button escape-button--no"
            style={{ left: `${noPosition.x}%`, top: `${noPosition.y}%` }}
            type="button"
            onPointerEnter={dodgeNo}
            onPointerDown={(event) => {
              event.preventDefault();
              dodgeNo();
            }}
            onFocus={dodgeNo}
            aria-label="Нет — кнопка всё равно убежит"
          >
            {noEscapes > 2 ? "Даже не пытайся" : "Нет"}
          </button>
        </div>

        <p className="hint" aria-live="polite">
          {noEscapes > 1
            ? "Кажется, у приглашения есть своё мнение."
            : "P.S. Один из вариантов здесь очень стеснительный."}
        </p>
      </section>
    </main>
  );
}

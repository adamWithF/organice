import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import './stylesheet.css';

import AgendaDay from './components/AgendaDay';
import Drawer from '../../../UI/Drawer';
import TabButtons from '../../../UI/TabButtons';

import { isMobileBrowser } from '../../../../lib/browser_utils';
import * as baseActions from '../../../../actions/base';
import * as orgActions from '../../../../actions/org';

import _ from 'lodash';
import {
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  startOfMonth,
  getDaysInMonth,
} from 'date-fns';
import format from 'date-fns/format';

// INFO: SearchModal, AgendaModal and TaskListModal are very similar
// in structure and partially in logic. When changing one, consider
// changing all.
function AgendaModal(props) {
  const {
    onClose,
    headers,
    todoKeywordSets,
    agendaTimeframe,
    agendaDefaultDeadlineDelayValue,
    agendaDefaultDeadlineDelayUnit,
  } = props;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateDisplayType, setDateDisplayType] = useState('absolute');

  function handleTimeframeTypeChange(agendaTimeframe) {
    props.base.setAgendaTimeframe(agendaTimeframe);
  }

  function handleNextDateClick() {
    switch (agendaTimeframe) {
      case 'Day':
        setSelectedDate(addDays(selectedDate, 1));
        break;
      case 'Week':
        setSelectedDate(addWeeks(selectedDate, 1));
        break;
      case 'Month':
        setSelectedDate(addMonths(selectedDate, 1));
        break;
      default:
        return '';
    }
  }

  function handleHeaderClick(headerId) {
    props.onClose();
    props.org.selectHeaderAndOpenParents(headerId);
  }

  function handlePreviousDateClick() {
    switch (agendaTimeframe) {
      case 'Day':
        setSelectedDate(subDays(selectedDate, 1));
        break;
      case 'Week':
        setSelectedDate(subWeeks(selectedDate, 1));
        break;
      case 'Month':
        setSelectedDate(subMonths(selectedDate, 1));
        break;
      default:
        return '';
    }
  }

  function handleToggleDateDisplayType() {
    setDateDisplayType(dateDisplayType === 'absolute' ? 'relative' : 'absolute');
  }

  function calculateTimeframeHeader() {
    switch (agendaTimeframe) {
      case 'Day':
        return format(selectedDate, 'MMMM do');
      case 'Week':
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = addWeeks(weekStart, 1);
        return `${format(weekStart, 'MMM do')} - ${format(weekEnd, 'MMM do')} (W${format(
          weekStart,
          'w'
        )})`;
      case 'Month':
        return format(selectedDate, 'MMMM');
      default:
        return '';
    }
  }

  let dates = [];
  switch (agendaTimeframe) {
    case 'Day':
      dates = [selectedDate];
      break;
    case 'Week':
      const weekStart = startOfWeek(selectedDate);
      dates = _.range(7).map((daysAfter) => addDays(weekStart, daysAfter));
      break;
    case 'Month':
      const monthStart = startOfMonth(selectedDate);
      dates = _.range(getDaysInMonth(selectedDate)).map((daysAfter) =>
        addDays(monthStart, daysAfter)
      );
      break;
    default:
  }

  return (
    <Drawer onClose={onClose} maxSize={true}>
      <h2 className="agenda__title">Agenda</h2>

      <div className="agenda__tab-container">
        <TabButtons
          buttons={['Day', 'Week', 'Month']}
          selectedButton={agendaTimeframe}
          onSelect={handleTimeframeTypeChange}
          useEqualWidthTabs
        />
      </div>

      <div className="agenda__timeframe-header-container">
        <i className="fas fa-chevron-left fa-lg" onClick={handlePreviousDateClick} />
        <div className="agenda__timeframe-header">{calculateTimeframeHeader()}</div>
        <i className="fas fa-chevron-right fa-lg" onClick={handleNextDateClick} />
      </div>

      <div
        className="agenda__days-container"
        style={isMobileBrowser ? undefined : { overflow: 'auto' }}
      >
        {dates.map((date) => (
          <AgendaDay
            key={format(date, 'yyyy MM dd')}
            date={date}
            headers={headers}
            onHeaderClick={handleHeaderClick}
            todoKeywordSets={todoKeywordSets}
            dateDisplayType={dateDisplayType}
            onToggleDateDisplayType={handleToggleDateDisplayType}
            agendaDefaultDeadlineDelayValue={agendaDefaultDeadlineDelayValue}
            agendaDefaultDeadlineDelayUnit={agendaDefaultDeadlineDelayUnit}
          />
        ))}
      </div>

      <br />
    </Drawer>
  );
}

const mapStateToProps = (state) => ({
  todoKeywordSets: state.org.present.get('todoKeywordSets'),
  agendaTimeframe: state.base.get('agendaTimeframe'),
  agendaDefaultDeadlineDelayValue: state.base.get('agendaDefaultDeadlineDelayValue') || 5,
  agendaDefaultDeadlineDelayUnit: state.base.get('agendaDefaultDeadlineDelayUnit') || 'd',
});

const mapDispatchToProps = (dispatch) => ({
  org: bindActionCreators(orgActions, dispatch),
  base: bindActionCreators(baseActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AgendaModal);

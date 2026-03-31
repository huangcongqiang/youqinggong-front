import { findDefaultRoom, findRoomByTaskId } from './messageRoomSelection.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nexpected: ${expected}\nactual: ${actual}`);
  }
}

const rooms = [
  {
    roomKey: 'room-older',
    taskId: 'task-001',
    lastTimestamp: 1743072000000
  },
  {
    roomKey: 'room-current',
    taskId: 'task-002',
    lastTimestamp: 1743075600000
  },
  {
    roomKey: 'room-middle',
    taskId: 'task-003',
    lastTime: '14:20'
  }
];

assertEqual(
  findRoomByTaskId(rooms, 'task-002')?.roomKey || '',
  'room-current',
  'findRoomByTaskId should return the room for the requested task instead of the first room in the raw array'
);

assertEqual(
  findDefaultRoom(rooms)?.roomKey || '',
  'room-current',
  'findDefaultRoom should follow the same activity ordering as the rendered room list'
);

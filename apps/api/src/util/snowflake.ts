import { Snowflake } from 'nodejs-snowflake';

const snowflake = new Snowflake({
  custom_epoch: new Date('2025-09-01T00:00:00Z').getTime(),
  instance_id: 1
});

export default snowflake;

/** Reservation for Lunchly */

const moment = require('moment');

const db = require('../db');

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  static async getTopReservations() {
    const results = await db.query(
      `SELECT COUNT(r.id) AS "numOfRes",
      c.first_name AS "firstName",
      c.last_name AS "lastName",
      c.id AS "custID"
      FROM reservations AS r 
      JOIN customers AS c 
      ON r.customer_id = c.id 
      GROUP BY c.first_name, c.last_name, c.id
      ORDER BY COUNT(r.id) DESC 
      LIMIT 10`
    );
    const answer = results.rows;
    console.log(answer);

    return answer;
  }
  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map((row) => new Reservation(row));
  }

  /** save this reservation. */
  // customer_id integer NOT NULL REFERENCES customers,
  // start_at timestamp without time zone NOT NULL,
  // num_guests integer NOT NULL,
  // notes text DEFAULT '' NOT NULL,
  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET customer_id=$1, start_at=$2, num_guests=$3, notes=$4
             WHERE id=$5`,
        [this.customerId, this.startAt, this.numGuests, this.notes, this.id]
      );
    }
  }
}

module.exports = Reservation;

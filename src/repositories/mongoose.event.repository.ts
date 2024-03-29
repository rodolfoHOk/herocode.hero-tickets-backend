import mongoose from 'mongoose';
import { Event } from '../entities/event';
import { EventRepository } from './event.repository';
import { Location } from '../entities/location';
import { IFilterProps } from '../use-cases/event.use-case';

const eventSchema = new mongoose.Schema({
  title: String,
  location: {
    latitude: String,
    longitude: String,
  },
  date: Date,
  description: String,
  categories: [String],
  banner: String,
  flyers: [String],
  coupons: [String],
  price: { type: Array },
  city: String,
  formattedAddress: String,
  participants: { type: Array, ref: 'User' },
  createdAt: { type: Date, default: Date.now() },
});

const EventModel = mongoose.model('Event', eventSchema);

class MongooseEventRepository implements EventRepository {
  async add(event: Event): Promise<Event> {
    const eventModel = new EventModel(event);

    await eventModel.save();
    return event;
  }

  async findByLocationAndDate(
    location: Location,
    date: Date
  ): Promise<Event | undefined> {
    const findEvent = await EventModel.findOne({ location, date }).exec();

    return findEvent ? findEvent.toObject() : undefined;
  }

  async findByCity(city: string): Promise<Event[]> {
    const findEvents = await EventModel.find({ city }).exec();

    return findEvents.map((event) => event.toObject());
  }

  async findByCategory(category: string): Promise<Event[]> {
    const findEvents = await EventModel.find({ categories: category }).exec();

    return findEvents.map((event) => event.toObject());
  }

  async filterBy({
    name,
    date,
    category,
    price,
    latitude,
    longitude,
    radius,
  }: IFilterProps): Promise<Event[]> {
    const query = {
      $and: [
        { title: name ? { $regex: name, $options: 'i' } : { $exists: true } },
        { date: date ? { $gte: date } : { $exists: true } },
        { categories: category ? { $in: [category] } : { $exists: true } },
        { 'price.amount': { $gte: price ? price : 0 } },
        {
          'location.latitude':
            latitude && longitude && radius
              ? {
                  $gte: String(latitude - Number(radius)),
                  $lte: String(latitude + Number(radius)),
                }
              : { $exists: true },
        },
        {
          'location.longitude':
            latitude && longitude && radius
              ? {
                  $gte: String(longitude - Number(radius)),
                  $lte: String(longitude + Number(radius)),
                }
              : { $exists: true },
        },
      ],
    };

    const findEvents = await EventModel.find(query).exec();

    return findEvents.map((event) => event.toObject());
  }

  async findMain(date: Date): Promise<Event[]> {
    const endDate = new Date(date);
    endDate.setMonth(endDate.getMonth() + 1);

    const findEvents = await EventModel.find({
      date: {
        $gte: date.toDateString(),
        $lte: endDate.toDateString(),
      },
    })
      .limit(4)
      .exec();

    return findEvents.map((event) => event.toObject());
  }

  async findByName(name: string): Promise<Event[]> {
    const findEvents = await EventModel.find({
      title: {
        $regex: name,
        $options: 'i',
      },
    }).exec();

    return findEvents.map((event) => event.toObject());
  }

  async findById(id: string): Promise<Event | undefined> {
    const findEvent = await EventModel.findOne({ _id: id }).exec();

    return findEvent ? findEvent.toObject() : undefined;
  }

  async update(id: string, event: Event): Promise<any> {
    const updateEvent = await EventModel.updateMany({ _id: id }, event).exec();

    return updateEvent;
  }
}

export { MongooseEventRepository };

import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

import Notification from '../schemas/notification';

class AppointmentController{

  async index(req, res){

    const { page = 1 } = req.query;

    const appointments  = await Appointment.findAll({
      where:{
        user_id: req.userId,
        canceled_at: null
      },
      attributes: ['id', 'date'],
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: {
        model: User,
        as: 'provider',
        attributes: ['id', 'name'],
        include:{
          model: File,
          as: 'avatar',
          attributes: ['path', 'url']
        }
      }
    })

    return res.json(appointments);
  }

  async store(req, res){

    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    })

    if( !(await schema.isValid(req.body)) ){
      return res.status(400).json({ error: 'Validation Fails' })
    }

    const { provider_id, date } = req.body;

    /* Check if provider_id is a provider */
    const isProvider = await User.findOne({ where: { id: provider_id, provider: true } })

    if( !isProvider || isProvider.id === req.userId ){
      return res.status(401).json({ error : 'You can only create appointments with provider different than u!'})
    }

    /* Check if user's trying to appointment an invalid hour  */
    const hourStart = startOfHour(parseISO(date));

    if( isBefore(hourStart, new Date()) ){
      return res.status(400).json({ error : "Past dates are not allowed" })
    }

    const checkAvailability = await Appointment.findOne({
      where:{
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    })

    if( checkAvailability ){
      return res.status(400).json({ error: 'Appointment date is not available' })
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date
    })

    /**
     NOTIFICANDO APONTAMENTO AO CLIENTE
     */
    const user = await User.findByPk(req.userId);

    /*                            variavel   formato a ser transformada           configs a+    */
    const formattedDate = format(hourStart, "'dia' dd 'de' MMMM',as' H:mm'h' ", { locale: pt } );

     await Notification.create({
       content: `Novo agendamento de ${user.name} para ${formattedDate}`,
       user: provider_id
     })

    return res.json(appointment)
  }

  async update(req, res){
    return res.json({ ok: true });
  }

  async delete(req, res){

    const appointment = await Appointment.findByPk(req.params.id);

    if( appointment.user_id !== req.userId ){
      return res.status(401).json(
        { error: 'You don`t have permission to delete this appointment!'},
      )
    }

    const dateWithSub = subHours(appointment.date, 2);

    if( isBefore(dateWithSub, new Date()) ){
      return res.status(401).json({
        error : 'You can only cancel appointments 2 hours in advance.'
      })
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    return res.json(appointment);

  }
}

export default new AppointmentController();

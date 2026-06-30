import prisma from "../../config/prisma";
import { AppointmentStatus, QuotationStatus, RequestStatus } from "@prisma/client";

interface CreateAppointmentInput {
  repairRequestId: number;
  quotationId: number;
  appointmentDate: Date;
}

interface UpdateAppointmentInput {
  appointmentDate?: Date;
  status?: AppointmentStatus;
}

export const createAppointment = async (data: CreateAppointmentInput) => {
  // Check if repair request exists
  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id: data.repairRequestId },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }


  const quotation = await prisma.quotation.findUnique({
    where: { id: data.quotationId },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  if (quotation.status !== QuotationStatus.ACCEPTED) {
    throw new Error("Only accepted quotations can create appointment");
  }

 
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      repairRequestId: data.repairRequestId,
    },
  });

  if (existingAppointment) {
    throw new Error("Appointment already exists for this repair request");
  }


  const appointment = await prisma.appointment.create({
    data: {
      repairRequestId: data.repairRequestId,
      quotationId: data.quotationId,
      appointmentDate: data.appointmentDate,
      status: AppointmentStatus.PENDING,
    },
    include: {
      repairRequest: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          selectedServiceCenters: true,
        },
      },
      quotation: {
        include: {
          serviceCenter: true,
        },
      },
    },
  });


  await prisma.repairRequest.update({
    where: { id: data.repairRequestId },
    data: {
      status: RequestStatus.APPOINTMENT_CONFIRMED,
    },
  });

  return appointment;
};

export const getAppointmentById = async (appointmentId: number) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      repairRequest: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          selectedServiceCenters: true,
          images: true,
        },
      },
      quotation: {
        include: {
          serviceCenter: true,
          payment: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return appointment;
};

export const getAppointmentByRepairRequest = async (repairRequestId: number) => {
  const appointment = await prisma.appointment.findFirst({
    where: { repairRequestId },
    include: {
      quotation: {
        include: {
          serviceCenter: true,
          payment: true,
        },
      },
    },
  });

  return appointment;
};

export const getCustomerAppointments = async (userId: number) => {
  const appointments = await prisma.appointment.findMany({
    where: {
      repairRequest: {
        userId,
      },
    },
    include: {
      repairRequest: {
        include: {
          selectedServiceCenters: true,
        },
      },
      quotation: {
        include: {
          serviceCenter: true,
          payment: true,
        },
      },
    },
    orderBy: {
      appointmentDate: "asc",
    },
  });

  return appointments;
};

export const updateAppointment = async (
  appointmentId: number,
  data: UpdateAppointmentInput
) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // Only allow update if appointment is pending or confirmed
  if (
    appointment.status !== AppointmentStatus.PENDING &&
    appointment.status !== AppointmentStatus.CONFIRMED
  ) {
    throw new Error("Only pending or confirmed appointments can be updated");
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      appointmentDate: data.appointmentDate,
      status: data.status,
    },
    include: {
      repairRequest: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      quotation: {
        include: {
          serviceCenter: true,
        },
      },
    },
  });

  if (data.status === AppointmentStatus.CONFIRMED) {
    await prisma.repairRequest.update({
      where: { id: appointment.repairRequestId },
      data: {
        status: RequestStatus.APPOINTMENT_CONFIRMED,
      },
    });
  }

  
  if (data.status === AppointmentStatus.COMPLETED) {
    await prisma.repairRequest.update({
      where: { id: appointment.repairRequestId },
      data: {
        status: RequestStatus.COMPLETED,
      },
    });
  }

  return updatedAppointment;
};

export const cancelAppointment = async (appointmentId: number) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status === AppointmentStatus.COMPLETED) {
    throw new Error("Completed appointments cannot be cancelled");
  }

  const cancelledAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: AppointmentStatus.CANCELLED,
    },
    include: {
      repairRequest: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      quotation: {
        include: {
          serviceCenter: true,
        },
      },
    },
  });

  
  await prisma.repairRequest.update({
    where: { id: appointment.repairRequestId },
    data: {
      status: RequestStatus.CANCELLED,
    },
  });

  return cancelledAppointment;
};

export const getUpcomingAppointments = async () => {
  const now = new Date();
  
  const appointments = await prisma.appointment.findMany({
    where: {
      appointmentDate: {
        gt: now,
      },
      status: {
        in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      },
    },
    include: {
      repairRequest: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          selectedServiceCenters: true,
        },
      },
      quotation: {
        include: {
          serviceCenter: true,
        },
      },
    },
    orderBy: {
      appointmentDate: "asc",
    },
  });

  return appointments;
};
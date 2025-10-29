import React, { useState } from "react";
import {
  Clock as UserClock, Users, Ticket, Calendar, Clock,
  TrendingUp, Activity, Building, Phone, Mail, MapPin,
  Award, Star, BarChart3, Target, X
} from "lucide-react";
import DynamicTable from "./microcomponents/DynamicTable";

const sampleLogins = [
  { id:1,staffName:"John Doe",employeeId:"EMP001",department:"Reception",position:"Senior Receptionist",loginDate:"2025-01-16",loginTime:"09:15 AM",logoutTime:"05:30 PM",workingHours:"8h 15m",tokensGenerated:12,patientsServed:45,status:"Active",shift:"Morning",location:"Main Desk",phone:"+1 234-567-8901",email:"john.doe@hospital.com",lastLogin:"2025-01-16 09:15:00",totalSessions:156,avgTokensPerDay:11.5,efficiency:92,rating:4.8 },
  { id:2,staffName:"Jane Smith",employeeId:"EMP002",department:"Reception",position:"Receptionist",loginDate:"2025-01-16",loginTime:"10:05 AM",logoutTime:"06:00 PM",workingHours:"7h 55m",tokensGenerated:8,patientsServed:32,status:"Active",shift:"Morning",location:"Information Desk",phone:"+1 234-567-8902",email:"jane.smith@hospital.com",lastLogin:"2025-01-16 10:05:00",totalSessions:89,avgTokensPerDay:9.2,efficiency:88,rating:4.6 },
  { id:3,staffName:"Mike Johnson",employeeId:"EMP003",department:"Front Desk",position:"Front Desk Supervisor",loginDate:"2025-01-15",loginTime:"08:50 AM",logoutTime:"05:00 PM",workingHours:"8h 10m",tokensGenerated:15,patientsServed:58,status:"Inactive",shift:"Morning",location:"Main Desk",phone:"+1 234-567-8903",email:"mike.johnson@hospital.com",lastLogin:"2025-01-15 08:50:00",totalSessions:234,avgTokensPerDay:13.8,efficiency:95,rating:4.9 },
  { id:4,staffName:"Sarah Wilson",employeeId:"EMP004",department:"Reception",position:"Junior Receptionist",loginDate:"2025-01-15",loginTime:"09:20 AM",logoutTime:"05:10 PM",workingHours:"7h 50m",tokensGenerated:10,patientsServed:38,status:"Active",shift:"Morning",location:"Appointment Desk",phone:"+1 234-567-8904",email:"sarah.wilson@hospital.com",lastLogin:"2025-01-15 09:20:00",totalSessions:67,avgTokensPerDay:8.9,efficiency:85,rating:4.4 },
  { id:5,staffName:"David Brown",employeeId:"EMP005",department:"Front Desk",position:"Night Shift Coordinator",loginDate:"2025-01-14",loginTime:"09:00 AM",logoutTime:"05:45 PM",workingHours:"8h 45m",tokensGenerated:18,patientsServed:62,status:"Active",shift:"Night",location:"Emergency Desk",phone:"+1 234-567-8905",email:"david.brown@hospital.com",lastLogin:"2025-01-14 09:00:00",totalSessions:178,avgTokensPerDay:15.2,efficiency:97,rating:4.9 },
  { id:6,staffName:"Emily Davis",employeeId:"EMP006",department:"Reception",position:"Senior Receptionist",loginDate:"2025-01-14",loginTime:"08:30 AM",logoutTime:"04:30 PM",workingHours:"8h 00m",tokensGenerated:14,patientsServed:51,status:"Active",shift:"Morning",location:"VIP Desk",phone:"+1 234-567-8906",email:"emily.davis@hospital.com",lastLogin:"2025-01-14 08:30:00",totalSessions:145,avgTokensPerDay:12.3,efficiency:91,rating:4.7 }
];

// Sample monthly data for each employee
const monthlyData = {
  1: {
    months: {
      "January 2025": {
        totalDays: 31,
        presentDays: 19,
        totalHours: "156h 30m",
        avgDailyHours: "8.2h",
        totalTokens: 240,
        totalPatients: 890,
        efficiency: 92,
        rating: 4.8,
        overtimeHours: "12h 30m",
        lateArrivals: 2,
        earlyDepartures: 1,
        onLeave: 2,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({
          day: i + 1,
          loginTime: "09:00 AM",
          logoutTime: "05:00 PM"
        }))
      },
      "February 2025": {
        totalDays: 28,
        presentDays: 18,
        totalHours: "140h 00m",
        avgDailyHours: "8.0h",
        totalTokens: 200,
        totalPatients: 800,
        efficiency: 90,
        rating: 4.7,
        overtimeHours: "10h 00m",
        lateArrivals: 1,
        earlyDepartures: 2,
        onLeave: 1,
        dailyStatus: Array.from({ length: 28 }, (_, i) => ({
          day: i + 1,
          loginTime: "09:00 AM",
          logoutTime: "05:00 PM"
        })),
      },
      "March 2025": {
        totalDays: 31,
        presentDays: 20,
        totalHours: "160h 00m",
        avgDailyHours: "8.0h",
        totalTokens: 250,
        totalPatients: 920,
        efficiency: 93,
        rating: 4.8,
        overtimeHours: "15h 00m",
        lateArrivals: 2,
        earlyDepartures: 1,
        onLeave: 2,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({
            day: i + 1,
          loginTime: "09:00 AM",
          logoutTime: "05:00 PM"
        })),
         
      },
      "April 2025": {
        totalDays: 30,
        presentDays: 19,
        totalHours: "152h 30m",
        avgDailyHours: "8.1h",
        totalTokens: 240,
        totalPatients: 880,
        efficiency: 91,
        rating: 4.7,
        overtimeHours: "12h 30m",
        lateArrivals: 1,
        earlyDepartures: 2,
        onLeave: 1,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({
         day: i + 1,
          loginTime: "09:00 AM",
          logoutTime: "05:00 PM"
        })),
        
      },
      "May 2025": {
        totalDays: 31,
        presentDays: 21,
        totalHours: "168h 00m",
        avgDailyHours: "8.3h",
        totalTokens: 260,
        totalPatients: 950,
        efficiency: 94,
        rating: 4.9,
        overtimeHours: "18h 00m",
        lateArrivals: 1,
        earlyDepartures: 0,
        onLeave: 2,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({
         day: i + 1,
          loginTime: "09:00 AM",
          logoutTime: "05:00 PM"
        })),
              },
      "June 2025": {
        totalDays: 30,
        presentDays: 20,
        totalHours: "160h 00m",
        avgDailyHours: "8.0h",
        totalTokens: 255,
        totalPatients: 910,
        efficiency: 92,
        rating: 4.8,
        overtimeHours: "14h 00m",
        lateArrivals: 2,
        earlyDepartures: 1,
        onLeave: 1,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          loginTime: "09:00 AM",
          logoutTime: "05:00 PM"
        })),
       
      }
    }
  },

  2: {
    months: {
      "January 2025": {
        totalDays: 31,
        presentDays: 18,
        totalHours: "142h 15m",
        avgDailyHours: "7.9h",
        totalTokens: 185,
        totalPatients: 640,
        efficiency: 88,
        rating: 4.6,
        overtimeHours: "6h 15m",
        lateArrivals: 3,
        earlyDepartures: 2,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({
        
        })),
    
      },
      "February 2025": {
        totalDays: 28,
        presentDays: 17,
        totalHours: "130h 00m",
        avgDailyHours: "7.6h",
        totalTokens: 160,
        totalPatients: 600,
        efficiency: 85,
        rating: 4.5,
        overtimeHours: "5h 00m",
        lateArrivals: 2,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 28 }, (_, i) => ({
       
        })),
         
      },
      "March 2025": {
        totalDays: 31,
        presentDays: 19,
        totalHours: "148h 00m",
        avgDailyHours: "7.8h",
        totalTokens: 190,
        totalPatients: 680,
        efficiency: 87,
        rating: 4.6,
        overtimeHours: "8h 00m",
        lateArrivals: 3,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({
          
        })),
        
      },
      "April 2025": {
        totalDays: 30,
        presentDays: 18,
        totalHours: "140h 00m",
        avgDailyHours: "7.7h",
        totalTokens: 180,
        totalPatients: 650,
        efficiency: 86,
        rating: 4.5,
        overtimeHours: "6h 30m",
        lateArrivals: 2,
        earlyDepartures: 2,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({
        
        })),
         
      },
      "May 2025": {
        totalDays: 31,
        presentDays: 20,
        totalHours: "155h 00m",
        avgDailyHours: "7.9h",
        totalTokens: 200,
        totalPatients: 710,
        efficiency: 89,
        rating: 4.7,
        overtimeHours: "10h 00m",
        lateArrivals: 2,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({
      
        })),
        
      },
      "June 2025": {
        totalDays: 30,
        presentDays: 19,
        totalHours: "150h 00m",
        avgDailyHours: "7.8h",
        totalTokens: 195,
        totalPatients: 690,
        efficiency: 88,
        rating: 4.6,
        overtimeHours: "9h 00m",
        lateArrivals: 3,
        earlyDepartures: 2,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({
        })),

      }
    }
  },

  3: {
    months: {
      "January 2025": {
        totalDays: 31,
        presentDays: 20,
        totalHours: "164h 00m",
        avgDailyHours: "8.2h",
        totalTokens: 310,
        totalPatients: 1160,
        efficiency: 95,
        rating: 4.9,
        overtimeHours: "24h 00m",
        lateArrivals: 0,
        earlyDepartures: 0,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "February 2025": {
        totalDays: 28,
        presentDays: 20,
        totalHours: "150h 00m",
        avgDailyHours: "8.1h",
        totalTokens: 280,
        totalPatients: 1100,
        efficiency: 94,
        rating: 4.8,
        overtimeHours: "20h 00m",
        lateArrivals: 1,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 28 }, (_, i) => ({ day: i + 1 }))
      },
      "March 2025": {
        totalDays: 31,
        presentDays: 22,
        totalHours: "172h 00m",
        avgDailyHours: "8.3h",
        totalTokens: 320,
        totalPatients: 1180,
        efficiency: 96,
        rating: 4.9,
        overtimeHours: "26h 00m",
        lateArrivals: 0,
        earlyDepartures: 0,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "April 2025": {
        totalDays: 30,
        presentDays: 21,
        totalHours: "165h 00m",
        avgDailyHours: "8.2h",
        totalTokens: 300,
        totalPatients: 1130,
        efficiency: 95,
        rating: 4.9,
        overtimeHours: "22h 00m",
        lateArrivals: 1,
        earlyDepartures: 0,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({ day: i + 1 }))
      },
      "May 2025": {
        totalDays: 31,
        presentDays: 23,
        totalHours: "178h 00m",
        avgDailyHours: "8.4h",
        totalTokens: 340,
        totalPatients: 1220,
        efficiency: 97,
        rating: 5.0,
        overtimeHours: "30h 00m",
        lateArrivals: 0,
        earlyDepartures: 0,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "June 2025": {
        totalDays: 30,
        presentDays: 22,
        totalHours: "170h 00m",
        avgDailyHours: "8.3h",
        totalTokens: 330,
        totalPatients: 1190,
        efficiency: 96,
        rating: 4.9,
        overtimeHours: "25h 00m",
        lateArrivals: 0,
        earlyDepartures: 0,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({ day: i + 1 }))
      }
    }
  },

  4: {
    months: {
      "January 2025": {
        totalDays: 31,
        presentDays: 17,
        totalHours: "133h 20m",
        avgDailyHours: "7.8h",
        totalTokens: 170,
        totalPatients: 570,
        efficiency: 85,
        rating: 4.4,
        overtimeHours: "3h 20m",
        lateArrivals: 4,
        earlyDepartures: 3,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "February 2025": {
        totalDays: 28,
        presentDays: 16,
        totalHours: "120h 00m",
        avgDailyHours: "7.5h",
        totalTokens: 140,
        totalPatients: 500,
        efficiency: 83,
        rating: 4.3,
        overtimeHours: "2h 00m",
        lateArrivals: 3,
        earlyDepartures: 2,
        dailyStatus: Array.from({ length: 28 }, (_, i) => ({ day: i + 1 }))
      },
      "March 2025": {
        totalDays: 31,
        presentDays: 18,
        totalHours: "140h 00m",
        avgDailyHours: "8.0h",
        totalTokens: 180,
        totalPatients: 600,
        efficiency: 86,
        rating: 4.4,
        overtimeHours: "5h 00m",
        lateArrivals: 3,
        earlyDepartures: 2,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "April 2025": {
        totalDays: 30,
        presentDays: 17,
        totalHours: "135h 00m",
        avgDailyHours: "7.9h",
        totalTokens: 170,
        totalPatients: 580,
        efficiency: 85,
        rating: 4.3,
        overtimeHours: "4h 00m",
        lateArrivals: 3,
        earlyDepartures: 2,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({ day: i + 1 }))
      },
      "May 2025": {
        totalDays: 31,
        presentDays: 19,
        totalHours: "147h 00m",
        avgDailyHours: "7.7h",
        totalTokens: 190,
        totalPatients: 650,
        efficiency: 88,
        rating: 4.5,
        overtimeHours: "7h 00m",
        lateArrivals: 2,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "June 2025": {
        totalDays: 30,
        presentDays: 18,
        totalHours: "140h 00m",
        avgDailyHours: "7.8h",
        totalTokens: 185,
        totalPatients: 620,
        efficiency: 87,
        rating: 4.4,
        overtimeHours: "6h 00m",
        lateArrivals: 3,
        earlyDepartures: 2,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({ day: i + 1 }))
      }
    }
  },

  5: {
    months: {
      "January 2025": {
        totalDays: 31,
        presentDays: 19,
        totalHours: "167h 15m",
        avgDailyHours: "8.8h",
        totalTokens: 342,
        totalPatients: 1240,
        efficiency: 97,
        rating: 4.9,
        overtimeHours: "27h 15m",
        lateArrivals: 1,
        earlyDepartures: 0,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "February 2025": {
        totalDays: 28,
        presentDays: 18,
        totalHours: "140h 00m",
        avgDailyHours: "8.0h",
        totalTokens: 220,
        totalPatients: 900,
        efficiency: 92,
        rating: 4.7,
        overtimeHours: "8h 00m",
        lateArrivals: 2,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 28 }, (_, i) => ({ day: i + 1 }))
      },
      "March 2025": {
        totalDays: 31,
        presentDays: 20,
        totalHours: "165h 00m",
        avgDailyHours: "8.25h",
        totalTokens: 280,
        totalPatients: 1000,
        efficiency: 95,
        rating: 4.8,
        overtimeHours: "20h 00m",
        lateArrivals: 1,
        earlyDepartures: 0,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "April 2025": {
        totalDays: 30,
        presentDays: 19,
        totalHours: "155h 00m",
        avgDailyHours: "8.16h",
        totalTokens: 260,
        totalPatients: 950,
        efficiency: 94,
        rating: 4.8,
        overtimeHours: "16h 00m",
        lateArrivals: 1,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({ day: i + 1 }))
      },
      "May 2025": {
        totalDays: 31,
        presentDays: 21,
        totalHours: "172h 00m",
        avgDailyHours: "8.19h",
        totalTokens: 300,
        totalPatients: 1100,
        efficiency: 96,
        rating: 4.9,
        overtimeHours: "25h 00m",
        lateArrivals: 1,
        earlyDepartures: 0,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "June 2025": {
        totalDays: 30,
        presentDays: 20,
        totalHours: "160h 00m",
        avgDailyHours: "8.0h",
        totalTokens: 285,
        totalPatients: 1020,
        efficiency: 95,
        rating: 4.8,
        overtimeHours: "18h 00m",
        lateArrivals: 2,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({ day: i + 1 }))
      }
    }
  },

  6: {
    months: {
      "January 2025": {
        totalDays: 31,
        presentDays: 18,
        totalHours: "144h 00m",
        avgDailyHours: "8.0h",
        totalTokens: 252,
        totalPatients: 918,
        efficiency: 91,
        rating: 4.7,
        overtimeHours: "8h 00m",
        lateArrivals: 2,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "February 2025": {
        totalDays: 28,
        presentDays: 17,
        totalHours: "130h 00m",
        avgDailyHours: "7.7h",
        totalTokens: 200,
        totalPatients: 800,
        efficiency: 89,
        rating: 4.6,
        overtimeHours: "6h 00m",
        lateArrivals: 1,
        earlyDepartures: 2,
        dailyStatus: Array.from({ length: 28 }, (_, i) => ({ day: i + 1 }))
      },
      "March 2025": {
        totalDays: 31,
        presentDays: 19,
        totalHours: "152h 00m",
        avgDailyHours: "8.0h",
        totalTokens: 230,
        totalPatients: 860,
        efficiency: 92,
        rating: 4.7,
        overtimeHours: "12h 00m",
        lateArrivals: 2,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "April 2025": {
        totalDays: 30,
        presentDays: 18,
        totalHours: "144h 00m",
        avgDailyHours: "8.0h",
        totalTokens: 220,
        totalPatients: 830,
        efficiency: 91,
        rating: 4.7,
        overtimeHours: "10h 00m",
        lateArrivals: 1,
        earlyDepartures: 2,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({ day: i + 1 }))
      },
      "May 2025": {
        totalDays: 31,
        presentDays: 20,
        totalHours: "160h 00m",
        avgDailyHours: "8.0h",
        totalTokens: 260,
        totalPatients: 1000,
        efficiency: 94,
        rating: 4.8,
        overtimeHours: "20h 00m",
        lateArrivals: 2,
        earlyDepartures: 1,
        dailyStatus: Array.from({ length: 31 }, (_, i) => ({ day: i + 1 }))
      },
      "June 2025": {
        totalDays: 30,
        presentDays: 19,
        totalHours: "150h 00m",
        avgDailyHours: "7.9h",
        totalTokens: 245,
        totalPatients: 920,
        efficiency: 93,
        rating: 4.7,
        overtimeHours: "15h 00m",
        lateArrivals: 1,
        earlyDepartures: 2,
        dailyStatus: Array.from({ length: 30 }, (_, i) => ({ day: i + 1 }))
      }
    }
  }
};


const day = d => new Date(d).toLocaleDateString("en-US",{weekday:"long"});
const calcStats = d=>{
  let uniq=new Set(d.map(e=>e.staffName)).size, tokens=d.reduce((a,e)=>a+e.tokensGenerated,0),
  pats=d.reduce((a,e)=>a+e.patientsServed,0), avgT=Math.round(tokens/uniq),
  avgH=Math.round(d.reduce((a,e)=>a+parseFloat(e.workingHours),0)/d.length*10)/10,
  eff=Math.round(d.reduce((a,e)=>a+e.efficiency,0)/d.length), active=d.filter(e=>e.status==="Active").length;
  return {uniq,tokens,pats,avgT,avgH,eff,active,total:d.length};
};

const cols=[
  {
    header:"Staff",
    accessor:"staffName",
    clickable: true,
    cell:r=><div className="flex gap-3 items-center">
      <div className="w-8 h-8 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white">{r.staffName.split(' ').map(n=>n[0]).join('')}</div>
      <div><div className="font-semibold text-[var(--primary-color)] cursor-pointer hover:text-[var(--accent-color)]">{r.staffName}</div><div className="text-xs text-gray-500">{r.employeeId} • {r.position}</div></div>
    </div>
  },
  {
    header:"Status",
    accessor:"status",
    cell:r=><span className={`px-2 py-1 rounded font-semibold text-xs ${r.status==="Active"?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>{r.status}</span>
  },
  {
    header:"Shift",
    accessor:"shift",
    cell:r=><span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-semibold text-xs">{r.shift}</span>
  },
  {
    header:"Time In/Out",
    accessor:"loginTime",
    cell:r=>r.status==="Active"
      ? <div className="space-y-1"><div className="flex gap-1 text-green-600"><Clock className="w-3 h-3"/>{r.loginTime}</div><div className="flex gap-1 text-red-600"><Clock className="w-3 h-3"/>{r.logoutTime}</div></div>
      : <span className="px-2 py-1 rounded bg-gray-100 text-gray-500">Not Available</span>
  },
  {header:"Tokens",accessor:"tokensGenerated",cell:r=><div className="flex gap-2 items-center"><Ticket className="w-4 h-4 text-[var(--primary-color)]"/>{r.tokensGenerated}</div>},
  {header:"Patients",accessor:"patientsServed",cell:r=><div className="flex gap-2 items-center"><Users className="w-4 h-4 text-[var(--accent-color)]"/>{r.patientsServed}</div>}
];

const filters=[
  {key:"status",label:"Status",options:[{value:"Active",label:"Active"},{value:"Inactive",label:"Inactive"}]},
  {key:"shift",label:"Shift",options:[{value:"Morning",label:"Morning"},{value:"Night",label:"Night"}]},
  {key:"location",label:"Location",options:[{value:"Main Desk",label:"Main Desk"},{value:"VIP Desk",label:"VIP Desk"}]}
];

export default function FrontDeskLoginReport() {
  const [animated, setAnim] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("January 2025");
  const stats = calcStats(sampleLogins);

  const click = (i) => {
    setAnim(p => [...p, i]);
    setTimeout(() => setAnim(p => p.filter(x => x !== i)), 700);
  };

  const handleCellClick = (row, col) => {
    if (col.accessor === "staffName") {
      setSelectedEmployee(row);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const Stat = ({ icon: Icon, lbl, val, sub, col, idx }) => (
    <div
      className={`card-stat ${col} cursor-pointer ${animated.includes(idx) ? "card-animate-pulse" : ""} w-full sm:w-auto`}
      onClick={() => click(idx)}
    >
      <div className="flex justify-between">
        <div>
          <p className="card-stat-label">{lbl}</p>
          <p className="card-stat-count">{val}</p>
          {sub && <p className="text-xs text-gray-500">{sub}</p>}
        </div>
        <div className={`card-icon ${col === "card-border-primary" ? "card-icon-primary" : "card-icon-accent"}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const exportCSV = (d) => {
    let headers = ["Staff", "EmpID", "Date", "In", "Out", "Tokens", "Patients", "Status", "Shift"];
    let csv = [
      headers.join(","),
      ...d.map(r => [
        r.staffName, r.employeeId, r.loginDate, r.loginTime, r.logoutTime,
        r.tokensGenerated, r.patientsServed, r.status, r.shift
      ].join(","))
    ].join("\n");
    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = `front-desk-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getWeekday = (monthStr, dayNum) => {
    const [monthName, year] = monthStr.split(" ");
    const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(monthName);
    const date = new Date(Number(year), monthIndex, dayNum);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const availableMonths = selectedEmployee ? Object.keys(monthlyData[selectedEmployee.id].months) : [];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="h4-heading flex gap-3 items-center text-lg sm:text-l">
            <UserClock className="text-[var(--primary-color)] w-6 h-6 sm:w-8 sm:h-8" />
            <span className="shimmer-text">Front Desk Login Report</span>
          </h1>
          <p className="paragraph text-sm sm:text-base">Monitor staff logins & performance (Click on staff name for detailed view)</p>
        </div>
        <button
          onClick={() => exportCSV(sampleLogins)}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-[var(--primary-color)] text-white rounded-lg shadow hover:opacity-90 transition w-full sm:w-auto"
        >
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={Users} lbl="Active Staff" val={stats.active} sub={`${stats.uniq} total`} col="card-border-primary" idx={0} />
        <Stat icon={Clock} lbl="Login Sessions" val={stats.total} sub={`Avg ${stats.avgH}h`} col="card-border-accent" idx={1} />
        <Stat icon={Ticket} lbl="Tokens" val={stats.tokens} sub={`Avg ${stats.avgT}/staff`} col="card-border-primary" idx={2} />
        <Stat icon={TrendingUp} lbl="Patients Served" val={stats.pats} sub={`${stats.eff}% efficiency`} col="card-border-accent" idx={3} />
      </div>

      {/* Dynamic Table */}
      <div className="rounded-lg animate-slideUp overflow-x-auto">
        <DynamicTable
          title="Staff Login Records"
          columns={cols}
          data={sampleLogins}
          filters={filters}
          onCellClick={handleCellClick}
          showExport={false}
        />
      </div>

      {/* Employee Details Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 modal-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto modal-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[var(--primary-color)] text-white p-4 sm:p-6 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--accent-color)] rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  {selectedEmployee.staffName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">{selectedEmployee.staffName}</h2>
                  <p className="text-gray-200 text-sm sm:text-base">{selectedEmployee.employeeId} • {selectedEmployee.position}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-300 transition-colors p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="detail-item primary">
                  <div className="detail-label text-sm sm:text-base">Department</div>
                  <div className="detail-value flex items-center gap-2 text-sm sm:text-base">
                    <Building className="w-4 h-4" />
                    {selectedEmployee.department}
                  </div>
                </div>
                <div className="detail-item accent">
                  <div className="detail-label text-sm sm:text-base">Position</div>
                  <div className="detail-value flex items-center gap-2 text-sm sm:text-base">
                    <Award className="w-4 h-4" />
                    {selectedEmployee.position}
                  </div>
                </div>
                <div className="detail-item primary">
                  <div className="detail-label text-sm sm:text-base">Location</div>
                  <div className="detail-value flex items-center gap-2 text-sm sm:text-base">
                    <MapPin className="w-4 h-4" />
                    {selectedEmployee.location}
                  </div>
                </div>
                <div className="detail-item accent">
                  <div className="detail-label text-sm sm:text-base">Phone</div>
                  <div className="detail-value flex items-center gap-2 text-sm sm:text-base">
                    <Phone className="w-4 h-4" />
                    {selectedEmployee.phone}
                  </div>
                </div>
                <div className="detail-item primary">
                  <div className="detail-label text-sm sm:text-base">Email</div>
                  <div className="detail-value flex items-center gap-2 text-sm sm:text-base">
                    <Mail className="w-4 h-4" />
                    {selectedEmployee.email}
                  </div>
                </div>
                <div className="detail-item accent">
                  <div className="detail-label text-sm sm:text-base">Rating</div>
                  <div className="detail-value flex items-center gap-2 text-sm sm:text-base">
                    <Star className="w-4 h-4" />
                    {selectedEmployee.rating}/5.0
                  </div>
                </div>
              </div>

              {/* Today's Performance */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-[var(--primary-color)] mb-3 sm:mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  Today's Performance ({selectedEmployee.loginDate})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-green-500">
                    <div className="text-xs sm:text-sm text-gray-600">Login Time</div>
                    <div className="text-base sm:text-lg font-semibold text-green-600">{selectedEmployee.loginTime}</div>
                  </div>
                  <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-red-500">
                    <div className="text-xs sm:text-sm text-gray-600">Logout Time</div>
                    <div className="text-base sm:text-lg font-semibold text-red-600">{selectedEmployee.logoutTime}</div>
                  </div>
                  <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="text-xs sm:text-sm text-gray-600">Working Hours</div>
                    <div className="text-base sm:text-lg font-semibold text-blue-600">{selectedEmployee.workingHours}</div>
                  </div>
                  <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-[var(--accent-color)]">
                    <div className="text-xs sm:text-sm text-gray-600">Efficiency</div>
                    <div className="text-base sm:text-lg font-semibold text-[var(--accent-color)]">{selectedEmployee.efficiency}%</div>
                  </div>
                </div>
              </div>

              {/* Monthly Summary */}
              {monthlyData[selectedEmployee.id] && monthlyData[selectedEmployee.id].months[selectedMonth] && (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--primary-color)] mb-3 sm:mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    Monthly Summary - {selectedMonth}
                  </h3>

                  {/* Monthly Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-[var(--primary-color)]">
                      <div className="text-xs sm:text-sm text-gray-600">Attendance</div>
                      <div className="text-base sm:text-lg font-semibold text-[var(--primary-color)]">
                        {monthlyData[selectedEmployee.id].months[selectedMonth].presentDays}/{monthlyData[selectedEmployee.id].months[selectedMonth].totalDays} days
                      </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-[var(--accent-color)]">
                      <div className="text-xs sm:text-sm text-gray-600">Total Hours</div>
                      <div className="text-base sm:text-lg font-semibold text-[var(--accent-color)]">
                        {monthlyData[selectedEmployee.id].months[selectedMonth].totalHours}
                      </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-purple-500">
                      <div className="text-xs sm:text-sm text-gray-600">Total Tokens</div>
                      <div className="text-base sm:text-lg font-semibold text-purple-600">
                        {monthlyData[selectedEmployee.id].months[selectedMonth].totalTokens}
                      </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-orange-500">
                      <div className="text-xs sm:text-sm text-gray-600">Total Patients</div>
                      <div className="text-base sm:text-lg font-semibold text-orange-600">
                        {monthlyData[selectedEmployee.id].months[selectedMonth].totalPatients}
                      </div>
                    </div>
                  </div>

                  {/* Additional Monthly Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-600">Avg Daily Hours</div>
                      <div className="text-base sm:text-lg font-semibold text-[var(--primary-color)]">
                        {monthlyData[selectedEmployee.id].months[selectedMonth].avgDailyHours}
                      </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-600">Overtime Hours</div>
                      <div className="text-base sm:text-lg font-semibold text-orange-600">
                        {monthlyData[selectedEmployee.id].months[selectedMonth].overtimeHours}
                      </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-600">Monthly Efficiency</div>
                      <div className="text-base sm:text-lg font-semibold text-[var(--accent-color)]">
                        {monthlyData[selectedEmployee.id].months[selectedMonth].efficiency}%
                      </div>
                    </div>
                  </div>

                  {/* Attendance Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-600">Late Arrivals</div>
                      <div className="text-base sm:text-lg font-semibold text-red-600">
                        {monthlyData[selectedEmployee.id].months[selectedMonth].lateArrivals} times
                      </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-600">Early Departures</div>
                      <div className="text-base sm:text-lg font-semibold text-red-600">
                        {monthlyData[selectedEmployee.id].months[selectedMonth].earlyDepartures} times
                      </div>
                    </div>
                  </div>

                  {/* Monthly Daily Status Breakdown */}
                  <div className="bg-white rounded-lg p-3 sm:p-4 mt-4">
                    <h4 className="font-semibold text-[var(--primary-color)] mb-2 sm:mb-3 flex items-center gap-2">
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Daily Calendar Breakdown
                    </h4>
                    <div className="mb-3">
                      <label className="mr-2 font-semibold text-sm sm:text-base">Select Month:</label>
                      <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
                      >
                        {availableMonths.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2">
                      {(() => {
                        if (!selectedEmployee) return null;
                        const empMonthData = monthlyData[selectedEmployee.id].months[selectedMonth];
                        if (!empMonthData) return null;
                        const lateArrivals = empMonthData.lateArrivals || 0;
                        const earlyDepartures = empMonthData.earlyDepartures || 0;
                        const onLeave = empMonthData.onLeave || 0;
                        const lateDays = Array.from({ length: lateArrivals }, (_, i) => i);
                        const earlyDays = Array.from({ length: earlyDepartures }, (_, i) => i + lateArrivals);
                        const leaveDays = Array.from({ length: onLeave }, (_, i) => i + lateArrivals + earlyDepartures);
                        return empMonthData.dailyStatus.map((d, idx) => {
                          const weekday = getWeekday(selectedMonth, d.day);
                          let isLate = lateDays.includes(idx);
                          let isEarly = earlyDays.includes(idx);
                          let isLeave = leaveDays.includes(idx);
                          const hasTimes = d.loginTime && d.logoutTime && !isLate && !isEarly && !isLeave;
                          let colorClass = hasTimes
                            ? "bg-green-100 text-green-800"
                            : isLate
                              ? "bg-red-200 text-red-900"
                              : isEarly
                                ? "bg-red-400 text-white"
                                : isLeave
                                  ? "bg-yellow-200 text-yellow-900"
                                  : "bg-red-100 text-red-800";
                          let borderClass = hasTimes
                            ? "border-green-400"
                            : isLate || isEarly
                              ? "border-red-600"
                              : isLeave
                                ? "border-yellow-500"
                                : "border-red-400";
                          return (
                            <div
                              key={idx}
                              className={`p-1 sm:p-2 rounded text-center text-xs font-semibold flex flex-col items-center justify-center ${colorClass} border ${borderClass}`}
                              style={{ minHeight: '60px' }}
                            >
                              <div className="font-bold text-[10px] sm:text-xs">{weekday.slice(0, 3)}</div>
                              <div className="text-xs sm:text-sm">{d.day}</div>
                              {hasTimes ? (
                                <div className="mt-1 text-[10px] sm:text-xs">
                                  <span className="inline-flex items-center gap-1 text-green-700"><Clock className="w-2 h-2 sm:w-3 sm:h-3" />In: {d.loginTime}</span><br />
                                  <span className="inline-flex items-center gap-1 text-red-700"><Clock className="w-2 h-2 sm:w-3 sm:h-3" />Out: {d.logoutTime}</span>
                                </div>
                              ) : isLate ? (
                                <div className="mt-1">
                                  <span className="px-1 py-0.5 sm:px-2 sm:py-1 rounded bg-red-300 text-white text-[10px] sm:text-xs">Late</span>
                                </div>
                              ) : isEarly ? (
                                <div className="mt-1">
                                  <span className="px-1 py-0.5 sm:px-2 sm:py-1 rounded bg-red-500 text-white text-[10px] sm:text-xs">Early</span>
                                </div>
                              ) : isLeave ? (
                                <div className="mt-1">
                                  <span className="px-1 py-0.5 sm:px-2 sm:py-1 rounded bg-yellow-300 text-yellow-900 text-[10px] sm:text-xs">Leave</span>
                                </div>
                              ) : (
                                <div className="mt-1">
                                  <span className="px-1 py-0.5 sm:px-2 sm:py-1 rounded bg-red-200 text-red-700 text-[10px] sm:text-xs">Absent</span>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
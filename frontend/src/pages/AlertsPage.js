// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { fetchAlerts, dismissAlert, markAllRead, generateAlerts } from '../store/slices/alertsSlice';
// import { PageHeader, EmptyState } from '../components/ui';

// const SEVERITY_STYLES = {
//   critical: { bg:'var(--red-dim)',   border:'rgba(240,82,82,0.25)',   icon:'🚨', color:'var(--red)',   label:'Critical' },
//   warning:  { bg:'var(--gold-dim)',  border:'rgba(240,180,41,0.25)',  icon:'⚠️', color:'var(--gold)',  label:'Warning'  },
//   info:     { bg:'var(--blue-dim)',  border:'rgba(79,142,247,0.25)',  icon:'ℹ️', color:'var(--blue)',  label:'Info'     },
//   success:  { bg:'var(--green-dim)', border:'rgba(49,196,141,0.25)', icon:'✅', color:'var(--green)', label:'Success'  }
// };

// export default function AlertsPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { alerts, unreadCount, loading } = useSelector(s => s.alerts);

//   useEffect(() => {
//     dispatch(fetchAlerts());
//     dispatch(generateAlerts());
//   }, [dispatch]);

//   const groupedAlerts = {
//     critical: alerts.filter(a => a.severity === 'critical'),
//     warning:  alerts.filter(a => a.severity === 'warning'),
//     info:     alerts.filter(a => a.severity === 'info'),
//     success:  alerts.filter(a => a.severity === 'success'),
//   };

//   return (
//     <div style={{ padding: '28px 28px 48px' }}>
//       <PageHeader
//         title="◉ Financial Alerts"
//         subtitle={`${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''}`}
//         action={
//           <div style={{ display: 'flex', gap: 8 }}>
//             <button className="btn btn-secondary btn-sm" onClick={() => dispatch(generateAlerts())}>↻ Refresh</button>
//             {unreadCount > 0 && <button className="btn btn-secondary btn-sm" onClick={() => dispatch(markAllRead())}>Mark All Read</button>}
//           </div>
//         }
//       />

//       {alerts.length === 0 ? (
//         <EmptyState icon="🔔" title="No alerts right now" subtitle="Your finances are looking good! Alerts will appear here when action is needed." />
//       ) : (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
//           {Object.entries(groupedAlerts).map(([severity, items]) => {
//             if (items.length === 0) return null;
//             const style = SEVERITY_STYLES[severity];
//             return (
//               <div key={severity}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//                   <span style={{ fontSize: 16 }}>{style.icon}</span>
//                   <span style={{ fontSize: 12, fontWeight: 800, color: style.color, textTransform: 'uppercase', letterSpacing: 1 }}>{style.label}</span>
//                   <span style={{ fontSize: 11, background: style.bg, color: style.color, borderRadius: 10, padding: '1px 7px', fontWeight: 700 }}>{items.length}</span>
//                 </div>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                   <AnimatePresence>
//                     {items.map((alert, i) => (
//                       <motion.div key={alert._id}
//                         initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
//                         transition={{ delay: i * 0.04 }}
//                         style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 12, padding: '14px 16px', position: 'relative' }}>
//                         {!alert.isRead && <div style={{ position: 'absolute', top: 14, right: 40, width: 7, height: 7, borderRadius: '50%', background: style.color }} />}
//                         <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingRight: 32 }}>
//                           <span style={{ fontSize: 20, flexShrink: 0 }}>{style.icon}</span>
//                           <div style={{ flex: 1 }}>
//                             <div style={{ fontSize: 14, fontWeight: 700, color: style.color, marginBottom: 4 }}>{alert.title}</div>
//                             <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: alert.actionLabel ? 10 : 0 }}>{alert.message}</div>
//                             {/* Fix: actionLabel button now navigates to actionRoute */}
//                             {alert.actionLabel && alert.actionRoute && (
//                               <button
//                                 onClick={() => navigate(alert.actionRoute)}
//                                 style={{ background: style.color + '22', border: `1px solid ${style.color}44`, borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: style.color, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
//                                 {alert.actionLabel}
//                               </button>
//                             )}
//                             <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>{new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
//                           </div>
//                         </div>
//                         <button onClick={() => dispatch(dismissAlert(alert._id))}
//                           style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
//                       </motion.div>
//                     ))}
//                   </AnimatePresence>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAlerts, dismissAlert, markAllRead, generateAlerts } from '../store/slices/alertsSlice';
import { PageHeader, EmptyState } from '../components/ui';

const SEVERITY_STYLES = {
  critical: { bg:'var(--red-dim)',   border:'rgba(240,82,82,0.25)',   icon:'🚨', color:'var(--red)',   label:'Critical' },
  warning:  { bg:'var(--gold-dim)',  border:'rgba(240,180,41,0.25)',  icon:'⚠️', color:'var(--gold)',  label:'Warning'  },
  info:     { bg:'var(--blue-dim)',  border:'rgba(79,142,247,0.25)',  icon:'ℹ️', color:'var(--blue)',  label:'Info'     },
  success:  { bg:'var(--green-dim)', border:'rgba(49,196,141,0.25)', icon:'✅', color:'var(--green)', label:'Success'  }
};

export default function AlertsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { alerts, unreadCount, loading } = useSelector(s => s.alerts);

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  const groupedAlerts = {
    critical: alerts.filter(a => a.severity === 'critical'),
    warning:  alerts.filter(a => a.severity === 'warning'),
    info:     alerts.filter(a => a.severity === 'info'),
    success:  alerts.filter(a => a.severity === 'success'),
  };

  return (
    <div style={{ padding: '28px 28px 48px' }}>
      <PageHeader
        title="◉ Financial Alerts"
        subtitle={`${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''}`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => dispatch(generateAlerts())}>↻ Refresh</button>
            {unreadCount > 0 && <button className="btn btn-secondary btn-sm" onClick={() => dispatch(markAllRead())}>Mark All Read</button>}
          </div>
        }
      />

      {alerts.length === 0 ? (
        <EmptyState icon="🔔" title="No alerts right now" subtitle="Your finances are looking good! Alerts will appear here when action is needed." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(groupedAlerts).map(([severity, items]) => {
            if (items.length === 0) return null;
            const style = SEVERITY_STYLES[severity];
            return (
              <div key={severity}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>{style.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: style.color, textTransform: 'uppercase', letterSpacing: 1 }}>{style.label}</span>
                  <span style={{ fontSize: 11, background: style.bg, color: style.color, borderRadius: 10, padding: '1px 7px', fontWeight: 700 }}>{items.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <AnimatePresence>
                    {items.map((alert, i) => (
                      <motion.div key={alert._id}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                        transition={{ delay: i * 0.04 }}
                        style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 12, padding: '14px 16px', position: 'relative' }}>
                        {!alert.isRead && <div style={{ position: 'absolute', top: 14, right: 40, width: 7, height: 7, borderRadius: '50%', background: style.color }} />}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingRight: 32 }}>
                          <span style={{ fontSize: 20, flexShrink: 0 }}>{style.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: style.color, marginBottom: 4 }}>{alert.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: alert.actionLabel ? 10 : 0 }}>{alert.message}</div>
                            {/* Fix: actionLabel button now navigates to actionRoute */}
                            {alert.actionLabel && alert.actionRoute && (
                              <button
                                onClick={() => navigate(alert.actionRoute)}
                                style={{ background: style.color + '22', border: `1px solid ${style.color}44`, borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: style.color, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                                {alert.actionLabel}
                              </button>
                            )}
                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>{new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                        </div>
                        <button onClick={() => dispatch(dismissAlert(alert._id))}
                          style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
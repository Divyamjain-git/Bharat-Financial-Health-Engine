// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { motion, AnimatePresence } from 'framer-motion';
// import { fetchGoals, createGoal, updateGoal, deleteGoal, fetchGoalSuggestions } from '../store/slices/goalsSlice';
// import { PageHeader, ProgressBar, EmptyState, StatCard } from '../components/ui';
// import { formatINR } from '../utils/currency';

// const GOAL_ICONS = { emergency_fund:'🛡️', home_purchase:'🏠', vehicle:'🚗', education:'🎓', retirement:'🏖️', vacation:'✈️', wedding:'💍', business:'🏪', investment:'📈', debt_freedom:'🔓', custom:'🎯' };
// const STATUS_COLORS = { active:'var(--teal)', achieved:'var(--green)', paused:'var(--gold)', cancelled:'var(--text-3)' };

// export default function GoalsPage() {
//   const dispatch = useDispatch();
//   const { goals, suggestions, loading } = useSelector(s => s.goals);
//   const [showForm, setShowForm] = useState(false);
//   const [editGoal, setEditGoal] = useState(null);
//   const [form, setForm] = useState({ title:'', category:'emergency_fund', targetAmount:'', currentAmount:'', monthlyContribution:'', targetDate:'', priority:'medium', notes:'' });

//   // Fix: replace prompt() with a proper inline add-amount modal
//   const [addAmountGoal, setAddAmountGoal] = useState(null);
//   const [addAmountValue, setAddAmountValue] = useState('');

//   useEffect(() => { dispatch(fetchGoals()); dispatch(fetchGoalSuggestions()); }, [dispatch]);

//   const totalTarget = goals.filter(g=>g.status==='active').reduce((s,g)=>s+(g.targetAmount||0),0);
//   const totalSaved  = goals.filter(g=>g.status==='active').reduce((s,g)=>s+(g.currentAmount||0),0);
//   const achieved    = goals.filter(g=>g.status==='achieved').length;

//   const handleSubmit = async () => {
//     const data = {
//       ...form,
//       icon: GOAL_ICONS[form.category]||'🎯',
//       targetAmount: parseFloat(form.targetAmount)||0,
//       currentAmount: parseFloat(form.currentAmount)||0,
//       monthlyContribution: parseFloat(form.monthlyContribution)||0,
//       targetDate: form.targetDate
//     };
//     if (editGoal) { await dispatch(updateGoal({ id:editGoal._id, data })); }
//     else { await dispatch(createGoal(data)); }
//     setShowForm(false); setEditGoal(null);
//     setForm({ title:'', category:'emergency_fund', targetAmount:'', currentAmount:'', monthlyContribution:'', targetDate:'', priority:'medium', notes:'' });
//   };

//   const handleEdit = (goal) => {
//     setEditGoal(goal);
//     setForm({ title:goal.title, category:goal.category, targetAmount:String(goal.targetAmount), currentAmount:String(goal.currentAmount), monthlyContribution:String(goal.monthlyContribution||''), targetDate: goal.targetDate?.split('T')[0]||'', priority:goal.priority, notes:goal.notes||'' });
//     setShowForm(true);
//   };

//   const handleAddAmount = async () => {
//     const amount = parseFloat(addAmountValue) || 0;
//     if (amount <= 0 || !addAmountGoal) return;
//     await dispatch(updateGoal({
//       id: addAmountGoal._id,
//       data: { currentAmount: Math.min(addAmountGoal.targetAmount, (addAmountGoal.currentAmount || 0) + amount) }
//     }));
//     setAddAmountGoal(null);
//     setAddAmountValue('');
//   };

//   return (
//     <div style={{ padding:'28px 28px 48px' }}>
//       <PageHeader title="🎯 Financial Goals" subtitle="Plan, track, and achieve your financial milestones"
//         action={<button className="btn btn-primary" onClick={()=>{ setEditGoal(null); setShowForm(true); }}>+ New Goal</button>}/>

//       {/* Stats */}
//       <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:24 }}>
//         <StatCard label="Total Target" value={formatINR(totalTarget)} sub={`${goals.filter(g=>g.status==='active').length} active goals`} color="var(--gold)" icon="🎯" delay={0}/>
//         <StatCard label="Total Saved" value={formatINR(totalSaved)} sub={`${totalTarget>0?Math.round((totalSaved/totalTarget)*100):0}% of targets`} color="var(--teal)" icon="💰" delay={0.05}/>
//         <StatCard label="Goals Achieved" value={achieved} sub="All time" color="var(--green)" icon="🏆" delay={0.1}/>
//       </div>

//       {/* Goal Form Modal */}
//       <AnimatePresence>
//         {showForm && (
//           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
//             style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
//             onClick={e=>{ if(e.target===e.currentTarget){setShowForm(false);setEditGoal(null);} }}>
//             <motion.div initial={{scale:0.94,y:20}} animate={{scale:1,y:0}} exit={{scale:0.94,y:20}}
//               style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:28, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
//               <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, marginBottom:20 }}>{editGoal?'Edit Goal':'New Goal'}</div>
//               <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
//                 <div className="form-group">
//                   <label className="form-label">Goal Title</label>
//                   <input className="form-input" placeholder="e.g. Down payment for home" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
//                 </div>
//                 <div className="grid-2">
//                   <div className="form-group">
//                     <label className="form-label">Category</label>
//                     <select className="form-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
//                       {Object.entries(GOAL_ICONS).map(([k,v])=><option key={k} value={k}>{v} {k.replace(/_/g,' ')}</option>)}
//                     </select>
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Priority</label>
//                     <select className="form-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
//                       <option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="grid-2">
//                   <div className="form-group">
//                     <label className="form-label">Target Amount (₹)</label>
//                     <input className="form-input" type="number" placeholder="0" value={form.targetAmount} onChange={e=>setForm({...form,targetAmount:e.target.value})}/>
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Already Saved (₹)</label>
//                     <input className="form-input" type="number" placeholder="0" value={form.currentAmount} onChange={e=>setForm({...form,currentAmount:e.target.value})}/>
//                   </div>
//                 </div>
//                 <div className="grid-2">
//                   <div className="form-group">
//                     <label className="form-label">Monthly Contribution (₹)</label>
//                     <input className="form-input" type="number" placeholder="0" value={form.monthlyContribution} onChange={e=>setForm({...form,monthlyContribution:e.target.value})}/>
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Target Date</label>
//                     <input className="form-input" type="date" value={form.targetDate} onChange={e=>setForm({...form,targetDate:e.target.value})}/>
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Notes (optional)</label>
//                   <input className="form-input" placeholder="Why this goal matters to you..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
//                 </div>
//                 <div style={{ display:'flex', gap:10, marginTop:4 }}>
//                   <button className="btn btn-secondary" style={{ flex:1 }} onClick={()=>{setShowForm(false);setEditGoal(null);}}>Cancel</button>
//                   <button className="btn btn-primary" style={{ flex:2 }} onClick={handleSubmit} disabled={loading}>
//                     {loading?<><span className="spinner"/>Saving...</>:editGoal?'Update Goal':'Create Goal'}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Add Amount Modal — replaces prompt() */}
//       <AnimatePresence>
//         {addAmountGoal && (
//           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
//             style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
//             onClick={e=>{ if(e.target===e.currentTarget){ setAddAmountGoal(null); setAddAmountValue(''); } }}>
//             <motion.div initial={{scale:0.94,y:20}} animate={{scale:1,y:0}} exit={{scale:0.94,y:20}}
//               style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:24, width:'100%', maxWidth:360 }}>
//               <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, marginBottom:6 }}>Add to Goal</div>
//               <div style={{ fontSize:13, color:'var(--text-2)', marginBottom:16 }}>{addAmountGoal.icon} {addAmountGoal.title}</div>
//               <div className="form-group" style={{ marginBottom:16 }}>
//                 <label className="form-label">Amount to Add (₹)</label>
//                 <input
//                   className="form-input"
//                   type="number"
//                   placeholder="e.g. 5000"
//                   value={addAmountValue}
//                   autoFocus
//                   onChange={e => setAddAmountValue(e.target.value)}
//                   onKeyDown={e => { if (e.key === 'Enter') handleAddAmount(); }}
//                 />
//               </div>
//               <div style={{ display:'flex', gap:10 }}>
//                 <button className="btn btn-secondary" style={{ flex:1 }} onClick={()=>{ setAddAmountGoal(null); setAddAmountValue(''); }}>Cancel</button>
//                 <button className="btn btn-primary" style={{ flex:2 }} onClick={handleAddAmount} disabled={loading}>
//                   {loading ? <><span className="spinner"/>Adding...</> : 'Add Amount'}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* AI Suggestions */}
//       {suggestions.length > 0 && (
//         <div style={{ marginBottom:20 }}>
//           <div style={{ fontSize:12, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>💡 Suggested for You</div>
//           <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
//             {suggestions.map((sug,i)=>(
//               <button key={i} onClick={()=>{ setForm({...form, title:sug.title, category:sug.category, targetAmount:String(sug.suggestedAmount||''), priority:sug.priority}); setShowForm(true); }}
//                 style={{ background:'var(--blue-dim)', border:'1px solid rgba(79,142,247,0.2)', borderRadius:9, padding:'8px 14px', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13, color:'var(--blue)', display:'flex', alignItems:'center', gap:6 }}>
//                 {sug.icon} {sug.title}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Goal Cards */}
//       {goals.length===0&&!loading ? (
//         <EmptyState icon="🎯" title="No goals yet" subtitle="Set your first financial goal to start planning"
//           action={<button className="btn btn-primary" onClick={()=>setShowForm(true)}>Create First Goal</button>}/>
//       ) : (
//         <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
//           {goals.map((goal,i)=>{
//             const pct  = Math.min(100,Math.round(((goal.currentAmount||0)/(goal.targetAmount||1))*100));
//             const months = goal.monthsRemaining||0;
//             const bar  = pct>=75?'var(--green)':pct>=40?'var(--gold)':'var(--blue)';
//             return (
//               <motion.div key={goal._id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="card" style={{ position:'relative' }}>
//                 <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:6 }}>
//                   <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, background:STATUS_COLORS[goal.status]+'20', color:STATUS_COLORS[goal.status], border:`1px solid ${STATUS_COLORS[goal.status]}30` }}>{goal.status}</span>
//                 </div>
//                 <div style={{ fontSize:28, marginBottom:8 }}>{goal.icon}</div>
//                 <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:800, marginBottom:3 }}>{goal.title}</div>
//                 <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:14, textTransform:'capitalize' }}>{goal.category.replace(/_/g,' ')} · {goal.priority} priority</div>
//                 <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
//                   <span style={{ fontSize:13, color:'var(--text-2)' }}>Progress</span>
//                   <span style={{ fontSize:14, fontWeight:900, color:bar }}>{pct}%</span>
//                 </div>
//                 <ProgressBar value={pct} color={bar} height={8}/>
//                 <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, marginBottom:14, fontSize:12 }}>
//                   <span style={{ color:'var(--text-2)' }}>{formatINR(goal.currentAmount||0)}</span>
//                   <span style={{ fontWeight:700 }}>{formatINR(goal.targetAmount)}</span>
//                 </div>
//                 <div style={{ display:'flex', gap:8, fontSize:11, color:'var(--text-3)', marginBottom:14, flexWrap:'wrap' }}>
//                   {goal.monthlyContribution>0&&<span>📆 ₹{(goal.monthlyContribution).toLocaleString('en-IN')}/mo</span>}
//                   <span>⏳ {months>0?`${months} months left`:'Past deadline'}</span>
//                 </div>
//                 <div style={{ display:'flex', gap:8 }}>
//                   <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={()=>handleEdit(goal)}>Edit</button>
//                   {goal.status === 'active' && (
//                     <button className="btn btn-secondary btn-sm" style={{ flex:1 }}
//                       onClick={() => { setAddAmountGoal(goal); setAddAmountValue(''); }}>
//                       + Add
//                     </button>
//                   )}
//                   <button className="btn btn-danger btn-sm" onClick={()=>dispatch(deleteGoal(goal._id))}>×</button>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchGoals, createGoal, updateGoal, deleteGoal, fetchGoalSuggestions } from '../store/slices/goalsSlice';
import { PageHeader, ProgressBar, EmptyState, StatCard } from '../components/ui';
import { formatINR } from '../utils/currency';

const GOAL_ICONS = { emergency_fund:'🛡️', home_purchase:'🏠', vehicle:'🚗', education:'🎓', retirement:'🏖️', vacation:'✈️', wedding:'💍', business:'🏪', investment:'📈', debt_freedom:'🔓', custom:'🎯' };
const STATUS_COLORS = { active:'var(--teal)', achieved:'var(--green)', paused:'var(--gold)', cancelled:'var(--text-3)' };

export default function GoalsPage() {
  const dispatch = useDispatch();
  const { goals, suggestions, loading } = useSelector(s => s.goals);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({ title:'', category:'emergency_fund', targetAmount:'', currentAmount:'', monthlyContribution:'', targetDate:'', priority:'medium', notes:'' });

  // Fix: replace prompt() with a proper inline add-amount modal
  const [addAmountGoal, setAddAmountGoal] = useState(null);
  const [addAmountValue, setAddAmountValue] = useState('');
  const [addAmountSubmitting, setAddAmountSubmitting] = useState(false);

  useEffect(() => { dispatch(fetchGoals()); dispatch(fetchGoalSuggestions()); }, [dispatch]);

  const totalTarget = goals.filter(g=>g.status==='active').reduce((s,g)=>s+(g.targetAmount||0),0);
  const totalSaved  = goals.filter(g=>g.status==='active').reduce((s,g)=>s+(g.currentAmount||0),0);
  const achieved    = goals.filter(g=>g.status==='achieved').length;

  const handleSubmit = async () => {
    const data = {
      ...form,
      icon: GOAL_ICONS[form.category]||'🎯',
      targetAmount: parseFloat(form.targetAmount)||0,
      currentAmount: parseFloat(form.currentAmount)||0,
      monthlyContribution: parseFloat(form.monthlyContribution)||0,
      targetDate: form.targetDate
    };
    if (editGoal) { await dispatch(updateGoal({ id:editGoal.id, data })); }
    else { await dispatch(createGoal(data)); }
    setShowForm(false); setEditGoal(null);
    setForm({ title:'', category:'emergency_fund', targetAmount:'', currentAmount:'', monthlyContribution:'', targetDate:'', priority:'medium', notes:'' });
  };

  const handleEdit = (goal) => {
    setEditGoal(goal);
    setForm({ title:goal.title, category:goal.category, targetAmount:String(goal.targetAmount), currentAmount:String(goal.currentAmount), monthlyContribution:String(goal.monthlyContribution||''), targetDate: goal.targetDate?.split('T')[0]||'', priority:goal.priority, notes:goal.notes||'' });
    setShowForm(true);
  };

  const handleAddAmount = async () => {
    const amount = parseFloat(addAmountValue) || 0;
    if (amount <= 0 || !addAmountGoal || addAmountSubmitting) return;
    setAddAmountSubmitting(true);
    await dispatch(updateGoal({
      id: addAmountGoal.id,
      data: { currentAmount: Math.min(addAmountGoal.targetAmount, (addAmountGoal.currentAmount || 0) + amount) }
    }));
    setAddAmountGoal(null);
    setAddAmountValue('');
    setAddAmountSubmitting(false);
  };

  return (
    <div style={{ padding:'28px 28px 48px' }}>
      <PageHeader title="🎯 Financial Goals" subtitle="Plan, track, and achieve your financial milestones"
        action={<button className="btn btn-primary" onClick={()=>{ setEditGoal(null); setShowForm(true); }}>+ New Goal</button>}/>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:24 }}>
        <StatCard label="Total Target" value={formatINR(totalTarget)} sub={`${goals.filter(g=>g.status==='active').length} active goals`} color="var(--gold)" icon="🎯" delay={0}/>
        <StatCard label="Total Saved" value={formatINR(totalSaved)} sub={`${totalTarget>0?Math.round((totalSaved/totalTarget)*100):0}% of targets`} color="var(--teal)" icon="💰" delay={0.05}/>
        <StatCard label="Goals Achieved" value={achieved} sub="All time" color="var(--green)" icon="🏆" delay={0.1}/>
      </div>

      {/* Goal Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
            onClick={e=>{ if(e.target===e.currentTarget){setShowForm(false);setEditGoal(null);} }}>
            <motion.div initial={{scale:0.94,y:20}} animate={{scale:1,y:0}} exit={{scale:0.94,y:20}}
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:28, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, marginBottom:20 }}>{editGoal?'Edit Goal':'New Goal'}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div className="form-group">
                  <label className="form-label">Goal Title</label>
                  <input className="form-input" placeholder="e.g. Down payment for home" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                      {Object.entries(GOAL_ICONS).map(([k,v])=><option key={k} value={k}>{v} {k.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                      <option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Target Amount (₹)</label>
                    <input className="form-input" type="number" placeholder="0" value={form.targetAmount} onChange={e=>setForm({...form,targetAmount:e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Already Saved (₹)</label>
                    <input className="form-input" type="number" placeholder="0" value={form.currentAmount} onChange={e=>setForm({...form,currentAmount:e.target.value})}/>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Monthly Contribution (₹)</label>
                    <input className="form-input" type="number" placeholder="0" value={form.monthlyContribution} onChange={e=>setForm({...form,monthlyContribution:e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Date</label>
                    <input className="form-input" type="date" value={form.targetDate} onChange={e=>setForm({...form,targetDate:e.target.value})}/>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <input className="form-input" placeholder="Why this goal matters to you..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
                </div>
                <div style={{ display:'flex', gap:10, marginTop:4 }}>
                  <button className="btn btn-secondary" style={{ flex:1 }} onClick={()=>{setShowForm(false);setEditGoal(null);}}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex:2 }} onClick={handleSubmit} disabled={loading}>
                    {loading?<><span className="spinner"/>Saving...</>:editGoal?'Update Goal':'Create Goal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Amount Modal — replaces prompt() */}
      <AnimatePresence>
        {addAmountGoal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
            onClick={e=>{ if(e.target===e.currentTarget){ setAddAmountGoal(null); setAddAmountValue(''); } }}>
            <motion.div initial={{scale:0.94,y:20}} animate={{scale:1,y:0}} exit={{scale:0.94,y:20}}
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:24, width:'100%', maxWidth:360 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, marginBottom:6 }}>Add to Goal</div>
              <div style={{ fontSize:13, color:'var(--text-2)', marginBottom:16 }}>{addAmountGoal.icon} {addAmountGoal.title}</div>
              <div className="form-group" style={{ marginBottom:16 }}>
                <label className="form-label">Amount to Add (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 5000"
                  value={addAmountValue}
                  autoFocus
                  onChange={e => setAddAmountValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddAmount(); }}
                />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-secondary" style={{ flex:1 }} onClick={()=>{ setAddAmountGoal(null); setAddAmountValue(''); }}>Cancel</button>
                <button className="btn btn-primary" style={{ flex:2 }} onClick={handleAddAmount} disabled={addAmountSubmitting}>
                  {addAmountSubmitting ? <><span className="spinner"/>Adding...</> : 'Add Amount'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>💡 Suggested for You</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {suggestions.map((sug,i)=>(
              <button key={i} onClick={()=>{ setForm({...form, title:sug.title, category:sug.category, targetAmount:String(sug.suggestedAmount||''), priority:sug.priority}); setShowForm(true); }}
                style={{ background:'var(--blue-dim)', border:'1px solid rgba(79,142,247,0.2)', borderRadius:9, padding:'8px 14px', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13, color:'var(--blue)', display:'flex', alignItems:'center', gap:6 }}>
                {sug.icon} {sug.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Goal Cards */}
      {goals.length===0&&!loading ? (
        <EmptyState icon="🎯" title="No goals yet" subtitle="Set your first financial goal to start planning"
          action={<button className="btn btn-primary" onClick={()=>setShowForm(true)}>Create First Goal</button>}/>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {goals.map((goal,i)=>{
            const pct  = Math.min(100,Math.round(((goal.currentAmount||0)/(goal.targetAmount||1))*100));
            const months = goal.monthsRemaining||0;
            const bar  = pct>=75?'var(--green)':pct>=40?'var(--gold)':'var(--blue)';
            return (
              <motion.div key={goal.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="card" style={{ position:'relative' }}>
                <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:6 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, background:STATUS_COLORS[goal.status]+'20', color:STATUS_COLORS[goal.status], border:`1px solid ${STATUS_COLORS[goal.status]}30` }}>{goal.status}</span>
                </div>
                <div style={{ fontSize:28, marginBottom:8 }}>{goal.icon}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:800, marginBottom:3 }}>{goal.title}</div>
                <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:14, textTransform:'capitalize' }}>{goal.category.replace(/_/g,' ')} · {goal.priority} priority</div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, color:'var(--text-2)' }}>Progress</span>
                  <span style={{ fontSize:14, fontWeight:900, color:bar }}>{pct}%</span>
                </div>
                <ProgressBar value={pct} color={bar} height={8}/>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, marginBottom:14, fontSize:12 }}>
                  <span style={{ color:'var(--text-2)' }}>{formatINR(goal.currentAmount||0)}</span>
                  <span style={{ fontWeight:700 }}>{formatINR(goal.targetAmount)}</span>
                </div>
                <div style={{ display:'flex', gap:8, fontSize:11, color:'var(--text-3)', marginBottom:14, flexWrap:'wrap' }}>
                  {goal.monthlyContribution>0&&<span>📆 ₹{(goal.monthlyContribution).toLocaleString('en-IN')}/mo</span>}
                  <span>⏳ {months>0?`${months} months left`:'Past deadline'}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={()=>handleEdit(goal)}>Edit</button>
                  {goal.status === 'active' && (
                    <button className="btn btn-secondary btn-sm" style={{ flex:1 }}
                      onClick={() => { setAddAmountGoal(goal); setAddAmountValue(''); }}>
                      + Add
                    </button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={()=>dispatch(deleteGoal(goal.id))}>×</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
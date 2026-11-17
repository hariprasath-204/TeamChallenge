'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
  Ticket,
} from 'lucide-react';
import Image from 'next/image';

interface MemberFormState {
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  photoUrl: string;
  photoPreview?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState('');
  const [college, setCollege] = useState('Ayya Nadar Janaki Ammal College');
  const [department, setDepartment] = useState('Department of Computer Applications');
  const [preferredPassword, setPreferredPassword] = useState('codathon@2027');
  const [leaderIndex, setLeaderIndex] = useState<number>(0);

  const [members, setMembers] = useState<MemberFormState[]>([
    {
      name: '',
      rollNo: '',
      email: '',
      phone: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    },
    {
      name: '',
      rollNo: '',
      email: '',
      phone: '',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    },
    {
      name: '',
      rollNo: '',
      email: '',
      phone: '',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [registeredTeam, setRegisteredTeam] = useState<any | null>(null);

  const updateMember = (index: number, field: keyof MemberFormState, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handlePhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      updateMember(index, 'photoPreview', base64);
      updateMember(index, 'photoUrl', base64);

      // Try uploading to Cloudinary / storage backend
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, filename: file.name }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          updateMember(index, 'photoUrl', data.url);
        }
      } catch {
        // Keeps local base64 fallback
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: teamName.trim(),
          college: college.trim(),
          department: department.trim(),
          members,
          leaderIndex,
          preferredPassword: preferredPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Registration failed. Please verify your details.');
        setIsSubmitting(false);
        return;
      }

      setRegisteredTeam(data.team);
    } catch {
      setErrorMessage('Network error while registering team. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col justify-center items-center p-4 py-12 relative overflow-hidden text-white font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gold-primary/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Header Branding */}
      <div className="text-center mb-8 max-w-2xl">
        <span className="ww-category-badge">AYYA NADAR JANAKI AMMAL COLLEGE (AUTONOMOUS)</span>
        <h1 className="font-cinzel text-3xl md:text-4xl font-extrabold gold-gradient-text tracking-wide mb-2">
          CODATHAN 2K27 Registration
        </h1>
        <p className="text-xs text-gray-400">
          Department of Computer Applications (UG & PG) • Register your Three-Member Team
        </p>
      </div>

      {registeredTeam ? (
        /* SUCCESS CONFIRMATION PASS CARD */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl ww-card p-8 border-gold-bright shadow-gold text-center relative"
        >
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-gradient-to-tr from-gold-dark via-gold-primary to-gold-bright text-void flex items-center justify-center shadow-gold">
            <Ticket className="w-8 h-8" />
          </div>

          <span className="text-[10px] uppercase font-cinzel tracking-widest text-gold-bright border-b border-gold-border/40 pb-1 inline-block mb-2">
            OFFICIAL ADMISSION PASS
          </span>

          <h2 className="font-cinzel text-2xl font-black gold-gradient-text mb-1">
            {registeredTeam.teamName}
          </h2>

          <div className="text-xs text-gray-400 mb-6 font-mono">
            Lot #{registeredTeam.lotNumber} • {registeredTeam.college}
          </div>

          {/* Credentials Box */}
          <div className="p-4 rounded bg-[#07090e] border border-gold-border/30 text-left font-mono text-xs space-y-2 mb-6">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Team ID (Username):</span>
              <span className="text-gold-light font-bold text-sm">{registeredTeam.id}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Team Leader:</span>
              <span className="text-gray-200">{registeredTeam.leaderName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Passcode:</span>
              <span className="text-emerald-400 font-bold">{registeredTeam.preferredPassword}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Storage Sync:</span>
              <span className="text-gold-bright">Firebase & Cloudinary Synchronized ✓</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6 text-left">
            {registeredTeam.members.map((m: { name: string; rollNo: string; photoUrl: string }, i: number) => (
              <div key={i} className="p-2.5 rounded bg-[#0c0f18] border border-gold-border/20 text-center">
                <div className="relative w-12 h-12 rounded-full mx-auto mb-1.5 overflow-hidden border border-gold-border/40 bg-black">
                  {m.photoUrl ? (
                    <Image
                      src={m.photoUrl}
                      alt={m.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <Users className="w-5 h-5 text-gold-primary mx-auto mt-3" />
                  )}
                </div>
                <div className="font-bold text-[11px] text-gray-200 truncate">{m.name}</div>
                <div className="text-[9px] text-gray-400 font-mono">{m.rollNo}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              localStorage.setItem('cdt_team_id', registeredTeam.id);
              localStorage.setItem('cdt_team_info', JSON.stringify(registeredTeam));
              router.push('/login');
            }}
            className="w-full btn-gold py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold"
          >
            <span>Proceed to Examination Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        /* REGISTRATION FORM */
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl ww-card p-6 md:p-8 border-gold-border/40 shadow-gold"
        >
          {errorMessage && (
            <div className="p-3.5 rounded bg-red-950/40 border border-red-500/50 text-red-200 text-xs mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Team General Details */}
          <div className="border-b border-gold-border/20 pb-6 mb-6">
            <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-gold-bright mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-primary" />
              <span>Team Credentials</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arcane Coders"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#07090e] border border-gold-border/30 text-white focus:outline-none focus:border-gold-primary"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">College *</label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#07090e] border border-gold-border/30 text-white focus:outline-none focus:border-gold-primary"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#07090e] border border-gold-border/30 text-white focus:outline-none focus:border-gold-primary"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Passcode / Key *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={preferredPassword}
                    onChange={(e) => setPreferredPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded bg-[#07090e] border border-gold-border/30 text-white focus:outline-none focus:border-gold-primary font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Three Members (Names, Roll Numbers, Images) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-gold-bright flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-primary" />
                <span>Three Registered Members (Names, Roll Numbers & Photographs)</span>
              </h2>
              <span className="text-[11px] text-gray-400 font-mono">Select ★ to designate Team Leader</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {members.map((member, idx) => {
                const isLeader = leaderIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border flex flex-col justify-between ${
                      isLeader
                        ? 'bg-gradient-to-b from-[#141926] to-[#0c0f18] border-gold-bright shadow-md'
                        : 'bg-[#080a12] border-gold-border/20'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-cinzel text-xs font-bold text-gold-primary">
                          MEMBER #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLeaderIndex(idx)}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono transition ${
                            isLeader
                              ? 'bg-gold-primary text-void shadow'
                              : 'bg-gold-border/20 text-gray-400 hover:text-gold-bright'
                          }`}
                        >
                          {isLeader ? '★ LEADER' : 'Make Leader'}
                        </button>
                      </div>

                      {/* Photo Upload / Preview */}
                      <div className="flex flex-col items-center mb-4">
                        <div className="relative w-24 h-24 rounded-full border-2 border-gold-border/50 overflow-hidden shadow mb-2 bg-[#101420] flex items-center justify-center">
                          {member.photoPreview || member.photoUrl ? (
                            <Image
                              src={member.photoPreview || member.photoUrl}
                              alt={member.name || `Member ${idx + 1}`}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <Camera className="w-8 h-8 text-gray-500" />
                          )}
                        </div>

                        <label className="cursor-pointer text-[11px] text-gold-bright hover:underline flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(idx, e)}
                          />
                        </label>
                      </div>

                      {/* Fields */}
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-[11px] text-gray-400 block mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Student Name"
                            value={member.name}
                            onChange={(e) => updateMember(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-[#07090e] border border-gold-border/20 text-white focus:outline-none focus:border-gold-primary"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-400 block mb-1">Roll Number *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 24MCA101"
                            value={member.rollNo}
                            onChange={(e) => updateMember(idx, 'rollNo', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-[#07090e] border border-gold-border/20 text-white focus:outline-none focus:border-gold-primary font-mono uppercase"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-400 block mb-1">Email</label>
                          <input
                            type="email"
                            placeholder="student@college.edu"
                            value={member.email}
                            onChange={(e) => updateMember(idx, 'email', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-[#07090e] border border-gold-border/20 text-white focus:outline-none focus:border-gold-primary font-mono text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-400 block mb-1">Mobile Phone</label>
                          <input
                            type="tel"
                            placeholder="10-digit phone"
                            value={member.phone}
                            onChange={(e) => updateMember(idx, 'phone', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-[#07090e] border border-gold-border/20 text-white focus:outline-none focus:border-gold-primary font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gold-border/20 gap-4">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data is stored directly in Firebase and Cloudinary for live examination verification.</span>
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold px-8 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering to Firebase...</span>
                </>
              ) : (
                <>
                  <span>Complete Team Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}

"use client";
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/Redux/store";
import { useUpdateUserMutation } from "@/Redux/api/userApi";
import { setCredentials } from "@/Redux/slices/authSlice";
import Image from "next/image";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { CalendarDays, Camera, Mail, Pencil, Phone, Sparkles, UserRound } from "lucide-react";
import { DashboardPageHeader } from "../DashboardClientLayout";
import { Badge, Button, Field, Input, Modal, Reveal, Stagger, StaggerItem, Textarea, cn } from "@/ui";

// Shape of the user object as it may arrive from the store / API
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileURL?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  skills?: string[] | string;
  joinDate?: string;
  role?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Display-friendly version for the component
interface DisplayUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileURL: string | null;
  profileImage: string | null;
  bio: string;
  skills: string[];
  joinDate: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const toIso = (value: Date | string | undefined | null): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const parseSkills = (skills: User["skills"]): string[] => {
  if (Array.isArray(skills)) return skills.map((s) => String(s).trim()).filter(Boolean);
  if (typeof skills === "string") return skills.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};

// Convert store user to DisplayUser. Missing values stay empty (no placeholder data),
// so saving the form never sends fake values to the API.
const convertToDisplayUser = (user: User | null): DisplayUser => {
  const createdAt = toIso(user?.createdAt) ?? "";
  const updatedAt = toIso(user?.updatedAt) ?? "";

  return {
    id: user?.id ?? "",
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    profileURL: user?.profileURL || null,
    profileImage: user?.profileImage || null,
    bio: user?.bio ?? "",
    skills: parseSkills(user?.skills),
    joinDate: user?.joinDate || (createdAt ? createdAt.split("T")[0] : ""),
    role: user?.role || "student",
    createdAt,
    updatedAt,
  };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserSettings: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const userData = auth.user as User | null;

  const [updateUser] = useUpdateUserMutation();
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<DisplayUser>(() => convertToDisplayUser(userData));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileURL: "",
    bio: "",
    skills: "",
    imageFile: null as File | null,
  });

  const resetForm = useCallback((displayUser: DisplayUser) => {
    setFormData({
      name: displayUser.name,
      email: displayUser.email,
      phone: displayUser.phone,
      profileURL: displayUser.profileURL || "",
      bio: displayUser.bio,
      skills: displayUser.skills.join(", "),
      imageFile: null,
    });
    setImagePreview(displayUser.profileImage || displayUser.profileURL);
    setImageFailed(false);
    setFormError(null);
  }, []);

  // Initialize form data when user changes
  useEffect(() => {
    const displayUser = convertToDisplayUser(userData);
    setUser(displayUser);
    resetForm(displayUser);
  }, [userData, resetForm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, imageFile: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageFailed(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = () => {
    resetForm(user);
    setIsModalOpen(true);
  };

  // Stable reference: the Modal re-runs its focus effect whenever onClose changes
  const handleCancel = useCallback(() => {
    if (isLoading) return;
    resetForm(user);
    setIsModalOpen(false);
  }, [isLoading, resetForm, user]);

  const handleSaveChanges = async () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const profileURL = formData.profileURL.trim();
    const bio = formData.bio.trim();
    const skills = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");

    if (!name) {
      setFormError("Please enter your name.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!user.id) {
      setFormError("Your session has expired. Please log in again.");
      return;
    }
    setFormError(null);
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", name);
      formDataToSend.append("email", email);
      formDataToSend.append("phone", phone);
      formDataToSend.append("profileURL", profileURL);
      formDataToSend.append("bio", bio);
      formDataToSend.append("skills", skills);

      if (formData.imageFile) {
        formDataToSend.append("profileImage", formData.imageFile);
      }

      const result = await updateUser({ id: user.id, data: formDataToSend }).unwrap();

      if (result?.user) {
        dispatch(
          setCredentials({
            user: result.user,
            token: auth?.token ?? "",
          })
        );
      }

      toast.success("Profile updated");
      setIsModalOpen(false);
    } catch (err) {
      let message = "Failed to update profile";

      if (err instanceof Error) {
        message = err.message;
      } else {
        const fetchError = err as FetchBaseQueryError;
        if (fetchError && "data" in fetchError && typeof fetchError.data === "object" && fetchError.data !== null) {
          const data = fetchError.data as { message?: string };
          if (data.message) message = data.message;
        }
      }

      setFormError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const initials = name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    return initials || "U";
  };

  const joinDateLabel = (() => {
    if (!user.joinDate) return "—";
    const d = new Date(user.joinDate);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  })();

  const avatarSrc = imagePreview && !imageFailed ? imagePreview : null;

  const renderAvatar = (size: number, name: string, className?: string) =>
    avatarSrc ? (
      <Image
        src={avatarSrc}
        alt={name || "Profile"}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={cn("rounded-full object-cover", className)}
        onError={() => setImageFailed(true)}
      />
    ) : (
      <div
        style={{ width: size, height: size }}
        className={cn("flex items-center justify-center rounded-full bg-brand-gradient font-semibold text-white", size > 70 ? "text-2xl" : "text-lg", className)}
      >
        {getInitials(name)}
      </div>
    );

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const skillPreview = formData.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const detailCard = (icon: React.ReactNode, title: string, children: React.ReactNode, className?: string) => (
    <div className={cn("h-full rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-ink-3">
        {icon}
        {title}
      </div>
      <div className="mt-3 text-ink">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Settings"
        subtitle="Manage your public profile."
        action={
          <Button onClick={openModal} size="sm">
            <Pencil className="h-4 w-4" aria-hidden />
            Edit profile
          </Button>
        }
      />

      {/* Profile card */}
      <Reveal>
        <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)]">
          <div className="relative h-28 bg-brand-gradient sm:h-32">
            <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
          </div>
          <div className="flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="-mt-12 shrink-0 rounded-full bg-white p-1.5 shadow-[var(--shadow-soft)] sm:-mt-14">
                {renderAvatar(96, user.name)}
              </div>
              <div className="min-w-0 pb-1">
                <h2 className="truncate text-2xl font-semibold tracking-tight text-ink">{user.name || "Your name"}</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-ink-3">
                  {user.email && (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="truncate">{user.email}</span>
                    </span>
                  )}
                  <Badge tone="brand">{roleLabel}</Badge>
                </div>
              </div>
            </div>
            <Button onClick={openModal} variant="outline" size="sm" className="self-start sm:self-auto">
              <Camera className="h-4 w-4" aria-hidden />
              Change photo
            </Button>
          </div>
        </section>
      </Reveal>

      {/* Details bento */}
      <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StaggerItem>
          {detailCard(
            <Phone className="h-4 w-4" aria-hidden />,
            "Phone",
            user.phone ? <p className="font-medium">{user.phone}</p> : <p className="text-ink-3">Not added</p>,
          )}
        </StaggerItem>
        <StaggerItem>
          {detailCard(<CalendarDays className="h-4 w-4" aria-hidden />, "Member since", <p className="font-medium">{joinDateLabel}</p>)}
        </StaggerItem>
        <StaggerItem>
          {detailCard(
            <Sparkles className="h-4 w-4" aria-hidden />,
            "Skills",
            user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((skill, index) => (
                  <Badge key={`${skill}-${index}`} tone="neutral">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-ink-3">No skills added yet.</p>
            ),
          )}
        </StaggerItem>
        <StaggerItem className="md:col-span-3">
          {detailCard(
            <UserRound className="h-4 w-4" aria-hidden />,
            "Bio",
            <p className={cn("whitespace-pre-line leading-relaxed", !user.bio && "text-ink-3")}>{user.bio || "No bio added yet."}</p>,
          )}
        </StaggerItem>
      </Stagger>

      {/* Edit modal */}
      <Modal open={isModalOpen} onClose={handleCancel} closeDisabled={isLoading} title="Edit profile" description="Changes are visible on your profile.">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSaveChanges();
          }}
          noValidate
          className="space-y-5"
        >
          {/* Profile image */}
          <div className="flex items-center gap-4 rounded-2xl bg-surface p-4">
            <div className="shrink-0">{renderAvatar(64, formData.name, "ring-2 ring-white")}</div>
            <div className="min-w-0 flex-1">
              <label
                htmlFor="profile-image"
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100"
              >
                <Camera className="h-4 w-4 text-brand-600" aria-hidden />
                Upload photo
                <input id="profile-image" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </label>
              <p className="mt-1.5 truncate text-xs text-ink-3">{formData.imageFile ? formData.imageFile.name : "JPG, PNG or WEBP. Max 5MB."}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { name: "name", label: "Full name", type: "text", placeholder: "Your full name", required: true, autoComplete: "name" },
              { name: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true, autoComplete: "email" },
              { name: "phone", label: "Phone number", type: "tel", placeholder: "Your phone number", required: false, autoComplete: "tel" },
              { name: "profileURL", label: "Profile URL", type: "url", placeholder: "https://", required: false, autoComplete: "url" },
            ].map((field) => (
              <Field key={field.name} label={field.label} htmlFor={`field-${field.name}`}>
                <Input
                  id={`field-${field.name}`}
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  autoComplete={field.autoComplete}
                  value={formData[field.name as keyof typeof formData] as string}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                />
              </Field>
            ))}
          </div>

          <Field label="Bio" htmlFor="field-bio" hint={`${formData.bio.length}/500`}>
            <Textarea id="field-bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={3} placeholder="A short introduction" maxLength={500} />
          </Field>

          <Field label="Skills" htmlFor="field-skills" hint="Separate with commas">
            <Input id="field-skills" type="text" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="React, TypeScript, Node.js" />
            {skillPreview.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skillPreview.map((skill, index) => (
                  <Badge key={`${skill}-${index}`} tone="brand">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </Field>

          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserSettings;

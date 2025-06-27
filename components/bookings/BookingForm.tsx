"use client"

import React, { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { DatePicker } from "../ui/date-picker"
import { TimeInput } from "../ui/time-input"
import { Checkbox } from "../ui/checkbox"
import { Switch } from "../ui/switch"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  Eye as EyeIcon,
  Info,
  Loader2,
  MapPin,
  Pencil as PencilIcon,
  PlusCircle,
  Repeat,
  Save,
  Tag,
  Users,
  X as XIcon
} from "lucide-react"
import { RecurrenceForm } from "./RecurrenceForm"
import { useToast } from "../ui/use-toast"
import { cn } from "../../lib/utils"

// Define form schema using Zod
const bookingFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  location: z.string({ required_error: "Please select a location" }),
  date: z.date({ required_error: "Please select a date" }),
  startTime: z.string({ required_error: "Please select a start time" }),
  endTime: z.string({ required_error: "Please select an end time" }),
  attendeeEstimate: z.coerce.number().min(1, { message: "Must have at least 1 attendee" }),
  budget: z.coerce.number().min(0, { message: "Budget must be a positive number" }),
  activityType: z.string({ required_error: "Please select an activity type" }),
  notes: z.string().optional(),
  sendCalendarInvite: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurrence: z.any().optional(),
  organizationId: z.string().optional(),
})

type BookingFormValues = z.infer<typeof bookingFormSchema>

// Default values for the form
const defaultValues: Partial<BookingFormValues> = {
  title: "",
  notes: "",
  attendeeEstimate: 10,
  budget: 0,
  sendCalendarInvite: false,
  isRecurring: false,
}

// Mock organizations for the demo
const mockOrganizations = [
  { id: "org-1", name: "Acme Corporation" },
  { id: "org-2", name: "Globex Industries" },
  { id: "org-3", name: "Initech LLC" },
  { id: "org-4", name: "Umbrella Corp" },
]

// Mock locations for the demo
const mockLocations = [
  { id: "loc-1", name: "Corporate Headquarters", address: "123 Business Park, Suite 400, San Francisco, CA 94107" },
  { id: "loc-2", name: "Downtown Conference Center", address: "555 Market St, San Francisco, CA 94105" },
  { id: "loc-3", name: "City Park Event Space", address: "Golden Gate Park, San Francisco, CA 94121" },
  { id: "loc-4", name: "Luxury Hotel & Spa", address: "888 Howard St, San Francisco, CA 94103" },
  { id: "loc-5", name: "Mountain Retreat Center", address: "1 Lodge Road, Lake Tahoe, CA 96150" },
]

// Activity types with categories
const activityTypes = [
  { value: "training", label: "Training", category: "Education" },
  { value: "workshop", label: "Workshop", category: "Education" },
  { value: "seminar", label: "Seminar", category: "Education" },
  { value: "team-building", label: "Team Building", category: "Team" },
  { value: "retreat", label: "Team Retreat", category: "Team" },
  { value: "conference", label: "Conference", category: "Events" },
  { value: "product-launch", label: "Product Launch", category: "Events" },
  { value: "networking", label: "Networking", category: "Events" },
  { value: "celebration", label: "Celebration", category: "Special" },
  { value: "meeting", label: "Executive Meeting", category: "Business" },
]

interface BookingFormProps {
  onSubmit?: (data: BookingFormValues) => void;
  onCancel?: () => void;
  defaultValues?: Partial<BookingFormValues>;
  editMode?: boolean;
}

export function BookingForm({ 
  onSubmit, 
  onCancel, 
  defaultValues: initialValues = {}, 
  editMode = false 
}: BookingFormProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>("basic")
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [isFormReady, setIsFormReady] = useState<boolean>(false)
  
  // For debugging
  console.log("DEBUG BookingForm - Received values:", initialValues)
  
  // Create a simple default values object 
  // We'll handle proper initialization in the useEffect with the ref
  const defaultFormValues = {
    title: "",
    location: "",
    date: new Date(),
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    attendeeEstimate: 10,
    budget: 0,
    activityType: "",
    notes: "",
    sendCalendarInvite: false,
    isRecurring: false,
  }
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: defaultFormValues,
    // This enables React Hook Form to reset the form when defaultValues change
    resetOptions: {
      keepDirtyValues: false, // Keep dirty values on form reset
    }
  })
  
  // Log the form values for debugging
  console.log("DEBUG BookingForm - Form values after init:", form.getValues())
  
  // FOR DEBUGGING - Log when the form is being rendered
  console.log("DEBUG RENDERING BOOKING FORM", { 
    formValues: form.getValues(),
    formState: form.formState,
    initialValues,
    editMode 
  })
  
  // Reset form when initialValues change (e.g., when async data loads)
  // Using a ref to prevent infinite loops
  const initialValuesRef = React.useRef<typeof initialValues | null>(null)
  
  // Force reset the form on component mount or when initialValues change
  useEffect(() => {
    // First render initialization
    if (initialValuesRef.current === null) {
      initialValuesRef.current = { ...initialValues }
      
      // Always initialize the form on first render, even with empty initialValues
      console.log("DEBUG BookingForm - Initial form initialization")
      resetFormWithValues()
      
      // Set form ready state slightly delayed to ensure rendering is complete
      setTimeout(() => {
        setIsFormReady(true)
        console.log("DEBUG BookingForm - Form is now ready")
      }, 100)
      return
    }
    
    // For subsequent renders, check if initialValues have actually changed
    if (JSON.stringify(initialValues) !== JSON.stringify(initialValuesRef.current)) {
      console.log("DEBUG BookingForm - Values changed, resetting form")
      initialValuesRef.current = { ...initialValues }
      resetFormWithValues()
      
      if (!isFormReady) {
        setTimeout(() => {
          setIsFormReady(true)
          console.log("DEBUG BookingForm - Form is now ready after values change")
        }, 100)
      }
    }
  }, [initialValues, isFormReady])
  
  // Helper function to reset form with consistent values
  function resetFormWithValues() {
    // Use today's date as default if no date provided
    const today = new Date()
    
    // If we have a date string, convert it to Date object
    let dateValue = initialValues.date
    if (typeof dateValue === 'string') {
      dateValue = new Date(dateValue)
    } else if (!(dateValue instanceof Date)) {
      dateValue = today
    }
    
    console.log("DEBUG BookingForm - Resetting form with date:", dateValue)
    
    // Force immediate form reset with all values
    form.reset({
      title: initialValues.title || "",
      location: initialValues.location || "",
      date: dateValue,
      startTime: initialValues.startTime || "09:00 AM",
      endTime: initialValues.endTime || "05:00 PM", 
      attendeeEstimate: initialValues.attendeeEstimate || 10,
      budget: initialValues.budget || 0,
      activityType: initialValues.activityType || "",
      notes: initialValues.notes || "",
      sendCalendarInvite: !!initialValues.sendCalendarInvite,
      isRecurring: !!initialValues.isRecurring,
      recurrence: initialValues.recurrence,
      organizationId: initialValues.organizationId,
    }, {
      keepDefaultValues: false,
    })
    
    // Force form update after reset
    setTimeout(() => {
      console.log("DEBUG BookingForm - After reset values:", form.getValues())
    }, 0)
  }
  
  // Type-safe form watching with specified fields
  const watchedFields = form.watch() as BookingFormValues
  
  function handleSubmit(data: BookingFormValues) {
    // Call the onSubmit handler if provided or show a toast
    if (onSubmit) {
      onSubmit(data)
    } else {
      toast({
        title: editMode ? "Booking updated" : "Booking request submitted",
        description: editMode 
          ? "Your booking has been updated successfully." 
          : "Your booking request has been submitted successfully.",
      })
    }
  }
  
  // Get form completion percentage
  const formCompletion = () => {
    const requiredFields = ["title", "location", "date", "startTime", "endTime", "activityType"];
    let completedFields = 0;
    
    const values = form.getValues() as BookingFormValues;
    
    requiredFields.forEach(field => {
      // Type-safe way to check field existence
      const value = values[field as keyof typeof values];
      if (value) {
        completedFields++;
      }
    });
    
    return Math.round((completedFields / requiredFields.length) * 100);
  };
  
  // Build a preview component to show form data as it's being entered
  const FormPreview = () => {
    const formValues = form.getValues() as BookingFormValues;
    
    // Find related data for display
    const locationData = formValues.location ? 
      mockLocations.find(loc => loc.id === formValues.location) : undefined;
      
    const activityData = formValues.activityType ? 
      activityTypes.find(at => at.value === formValues.activityType) : undefined;
    
    // Format date for display
    const formattedDate = formValues.date ? 
      new Date(formValues.date).toLocaleDateString('en-US', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }) : 'Date not selected';
    
    // Format budget for display
    const formattedBudget = typeof formValues.budget === 'number' 
      ? formValues.budget.toLocaleString() 
      : '0';
    
    // Format recurrence pattern
    const recurrenceType = formValues.recurrence?.frequency === "weekly" 
      ? "Weekly" 
      : formValues.recurrence?.frequency === "daily" 
        ? "Daily" 
        : formValues.recurrence?.frequency === "monthly" 
          ? "Monthly"
          : "";
    
    return (
      <div className="bg-muted/20 dark:bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold dark:text-white">Booking Summary</h3>
        
        <div className="mt-4 space-y-4">
          {/* Title */}
          {formValues.title && (
            <div className="flex items-center">
              <Tag className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="font-medium text-lg dark:text-white">{formValues.title}</p>
                {activityData && (
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{activityData.label}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Date and Time */}
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <div>
              <p className="font-medium">{formattedDate}</p>
              {formValues.startTime && formValues.endTime && (
                <p className="text-sm text-muted-foreground">{formValues.startTime} - {formValues.endTime}</p>
              )}
            </div>
          </div>
          
          {/* Location */}
          {locationData && (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <p className="font-medium">{locationData.name}</p>
                <p className="text-sm text-muted-foreground">{locationData.address}</p>
              </div>
            </div>
          )}
          
          {/* Recurrence */}
          {formValues.isRecurring && (
            <div className="flex items-center">
              <Repeat className="h-5 w-5 text-primary mr-2" />
              <div>
                <Badge variant="outline" className="font-normal">Recurring Event</Badge>
                {recurrenceType && (
                  <p className="text-sm text-muted-foreground mt-1">{recurrenceType}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Attendees */}
          <div className="flex items-center">
            <Users className="h-5 w-5 text-primary mr-2" />
            <p className="font-medium">{formValues.attendeeEstimate || 0} Attendees</p>
          </div>
          
          {/* Budget */}
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-primary mr-2" />
            <p className="font-medium">${formattedBudget} Budget</p>
          </div>
          
          {/* Notes */}
          {formValues.notes && (
            <div className="pt-2">
              <p className="font-medium mb-1">Additional Notes:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {formValues.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Display loading indicator while form is initializing
  if (!isFormReady) {
    return (
      <div className="w-full">
        <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm">
          <div className="p-6 border-b dark:border-gray-800">
            <h1 className="text-2xl font-bold dark:text-white">New Booking</h1>
            <p className="text-muted-foreground dark:text-gray-400 mt-1">Preparing your booking form...</p>
          </div>
          <div className="p-12 flex justify-center items-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading form fields...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm">
          {/* Form header */}
          <div className="p-6 border-b dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">{editMode ? "Edit Booking" : "New Booking"}</h1>
              <p className="text-muted-foreground dark:text-gray-400 mt-1">{editMode ? "Update booking details" : "Create a new booking for your event"}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-muted dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all" 
                      style={{ width: `${formCompletion()}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground dark:text-gray-400">{formCompletion()}%</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? "Edit Details" : "Preview"}
              </Button>
            </div>
          </div>
          
          {previewMode ? (
            <div className="p-6">
              <FormPreview />
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editMode ? "Update Booking" : "Create Booking"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Form content with tabs */}
              <div className="p-6">
                <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:inline-flex">
                    <TabsTrigger 
                      value="basic" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger 
                      value="details"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="schedule"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Schedule
                    </TabsTrigger>
                    <TabsTrigger 
                      value="additional"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Additional
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Quarterly Team Training"
                                  className="text-base"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Clear, descriptive name for your event
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="organizationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select organization">
                                    {field.value && mockOrganizations.find(org => org.id === field.value)?.name}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockOrganizations.map(org => (
                                  <SelectItem 
                                    key={org.id} 
                                    value={org.id}
                                    className={field.value === org.id ? "bg-primary/10" : ""}
                                  >
                                    {org.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Organization associated with this booking
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="activityType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type">
                                    {field.value && activityTypes.find(item => item.value === field.value)?.label}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(
                                  activityTypes.reduce((acc, item) => {
                                    if (!acc[item.category]) acc[item.category] = [];
                                    acc[item.category].push(item);
                                    return acc;
                                  }, {} as Record<string, typeof activityTypes>)
                                ).map(([category, items]) => (
                                  <React.Fragment key={category}>
                                    <SelectItem value={category} disabled className="text-muted-foreground py-1.5">
                                      {category}
                                    </SelectItem>
                                    {items.map(item => (
                                      <SelectItem 
                                        key={item.value} 
                                        value={item.value} 
                                        className={field.value === item.value ? "bg-primary/10" : ""}
                                      >
                                        {item.label}
                                      </SelectItem>
                                    ))}
                                    <Separator className="my-1" />
                                  </React.Fragment>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Type of activity for this booking
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Event details, special requirements, or additional information"
                                className="min-h-32 resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Detailed description to help prepare for the event
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={onCancel}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab("details")}
                      >
                        Next: Details
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Details Tab */}
                  <TabsContent value="details" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Location</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location">
                                    {field.value && mockLocations.find(loc => loc.id === field.value)?.name}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockLocations.map(location => (
                                  <SelectItem 
                                    key={location.id} 
                                    value={location.id}
                                    className={field.value === location.id ? "bg-primary/10" : ""}
                                  > 
                                    {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {field.value && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {mockLocations.find(loc => loc.id === field.value)?.address}
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="attendeeEstimate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Attendees</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number" 
                                  className="pl-9" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Number of people expected to attend
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number" 
                                  className="pl-9" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Total budget allocated for this event
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab("basic")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab("schedule")}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Next: Schedule
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Schedule Tab */}
                  <TabsContent value="schedule" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <DatePicker 
                                date={field.value instanceof Date ? field.value : undefined} 
                                setDate={(date) => {
                                  console.log("DEBUG DatePicker onChange:", date);
                                  field.onChange(date);
                                }}
                                className="w-full"
                              />
                            </FormControl>
                            <FormDescription>
                              Select the event date
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <TimeInput 
                                    value={field.value || "09:00 AM"}
                                    onChange={(value) => {
                                      console.log("DEBUG TimeInput Start onChange:", value);
                                      field.onChange(value);
                                    }}
                                    placeholder="Start"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                  <TimeInput 
                                    value={field.value || "05:00 PM"}
                                    onChange={(value) => {
                                      console.log("DEBUG TimeInput End onChange:", value);
                                      field.onChange(value);
                                    }}
                                    placeholder="End"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Recurring Event</FormLabel>
                            <FormDescription>
                              Setup a recurring schedule for this event
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {Boolean(watchedFields.isRecurring) && (
                      <div className="border rounded-md p-4 bg-muted/20">
                        <h3 className="font-medium text-sm mb-4 flex items-center">
                          <Repeat className="h-4 w-4 mr-2" />
                          Recurrence Pattern
                        </h3>
                        <RecurrenceForm 
                          value={watchedFields.recurrence} 
                          onChange={(recurrenceData) => {
                            form.setValue("recurrence" as const, recurrenceData);
                          }}
                          startDate={watchedFields.date}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab("details")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab("additional")}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Next: Additional
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Additional Tab */}
                  <TabsContent value="additional" className="space-y-6">
                    <FormField
                      control={form.control}
                      name="sendCalendarInvite"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Send calendar invites</FormLabel>
                            <FormDescription>
                              Automatically send calendar invites to team members when the booking is confirmed
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-muted/20 dark:bg-gray-800/50 rounded-md p-4 flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground dark:text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm dark:text-white">What happens next?</h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                          After submitting, your booking will be reviewed by a field manager. 
                          You will receive a notification when the status changes. You can view 
                          the status of your booking in the bookings dashboard.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab("schedule")}
                        className="dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="px-8 bg-primary hover:bg-primary/90"
                      >
                        {editMode ? (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Update Booking
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Submit Booking
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </div>
        </form>
      </Form>
    </div>
  )
}
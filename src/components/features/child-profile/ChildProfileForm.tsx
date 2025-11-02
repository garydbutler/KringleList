"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AgeBand } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AGE_BANDS, INTERESTS, VALUES } from "@/lib/utils/constants";
import { Child } from "@prisma/client";

const childFormSchema = z.object({
  nickname: z
    .string()
    .min(1, "Nickname is required")
    .max(20, "Nickname must be 20 characters or less"),
  ageBand: z.enum(["ZERO_TO_TWO", "THREE_TO_FOUR", "FIVE_TO_SEVEN", "EIGHT_TO_TEN", "ELEVEN_TO_THIRTEEN", "FOURTEEN_PLUS"] as const, {
    message: "Please select an age band",
  }),
  interests: z
    .array(z.string())
    .min(1, "Select at least one interest")
    .max(8, "Maximum 8 interests"),
  values: z.array(z.string()).optional(),
  budget: z.union([
    z.number().min(0, "Budget must be positive").max(1000, "Budget must be $1000 or less"),
    z.null(),
    z.undefined()
  ]).optional(),
});

type ChildFormValues = z.infer<typeof childFormSchema>;

type ChildProfileFormProps = {
  defaultValues?: Partial<Child>;
  onSubmit: (data: ChildFormValues & { budgetCents?: number }) => void;
  isLoading?: boolean;
};

export function ChildProfileForm({
  defaultValues,
  onSubmit,
  isLoading,
}: ChildProfileFormProps) {
  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      nickname: defaultValues?.nickname || "",
      ageBand: defaultValues?.ageBand || undefined,
      interests: defaultValues?.interests || [],
      values: defaultValues?.values || [],
      budget: defaultValues?.budgetCents
        ? defaultValues.budgetCents / 100
        : undefined,
    },
  });

  const handleSubmit = (data: ChildFormValues) => {
    // Convert budget to cents
    const budgetCents = data.budget ? Math.round(data.budget * 100) : undefined;
    onSubmit({
      ...data,
      budgetCents,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Nickname */}
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nickname</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Emma" {...field} />
              </FormControl>
              <FormDescription>
                A name to identify this child (max 20 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Age Band */}
        <FormField
          control={form.control}
          name="ageBand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age Band</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ZERO_TO_TWO">0-2 years</SelectItem>
                  <SelectItem value="THREE_TO_FOUR">3-4 years</SelectItem>
                  <SelectItem value="FIVE_TO_SEVEN">5-7 years</SelectItem>
                  <SelectItem value="EIGHT_TO_TEN">8-10 years</SelectItem>
                  <SelectItem value="ELEVEN_TO_THIRTEEN">11-13 years</SelectItem>
                  <SelectItem value="FOURTEEN_PLUS">14+ years</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Select the child's age range</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Interests */}
        <FormField
          control={form.control}
          name="interests"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Interests</FormLabel>
                <FormDescription>
                  Select up to 8 interests (at least 1 required)
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((interest) => (
                  <FormField
                    key={interest}
                    control={form.control}
                    name="interests"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={interest}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(interest)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, interest])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== interest
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {interest}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Values */}
        <FormField
          control={form.control}
          name="values"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Values (Optional)</FormLabel>
                <FormDescription>
                  Select values that matter for gift selection
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {VALUES.map((value) => (
                  <FormField
                    key={value}
                    control={form.control}
                    name="values"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={value}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(value)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), value])
                                  : field.onChange(
                                      field.value?.filter(
                                        (val) => val !== value
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {value}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Budget */}
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="0"
                    step="5"
                    min="0"
                    max="1000"
                    className="pl-7"
                    {...field}
                    value={field.value ?? ""}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Set a gift budget for this child (in $5 increments, max $1000)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : defaultValues ? "Update Profile" : "Create Profile"}
        </Button>
      </form>
    </Form>
  );
}
